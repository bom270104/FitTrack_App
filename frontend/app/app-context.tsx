import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import mapDashboardToHealthData from "./utils/statsMapper";

export type ScreenName =
    | "splash"
    | "login"
    | "register"
    | "dashboard"
    | "bmi"
    | "calories"
    | "water"
    | "statistics"
    | "profile"
    | "goals";

type WeightPoint = { date: string; weight: number };
type WaterPoint = { date: string; amount: number };

type UserData = {
    name: string;
    email: string;
    age: number;
    height: number;
    weight: number;
    gender: string;
    activityLevel: string;
    goal: string;
    dailyWaterGoal: number;
};

type HealthData = {
    currentWeight: number;
    targetWeight: number;
    bmi: number;
    tdee: number;
    calorieGoal: number;
    dailyCalories: number;
    waterIntake: number;
    waterGoal: number;
    weightHistory: WeightPoint[];
    waterHistory: WaterPoint[];
};

type AppContextValue = {
    screen: ScreenName;
    setScreen: (screen: ScreenName) => void;
    userData: UserData | null;
    healthData: HealthData;
    authFetch: (path: string, opts?: RequestInit) => Promise<Response | null>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (payload: any) => Promise<boolean>;
    logout: () => void;
    postBmi: (payload: { height: number; weight: number; bmi: number }) => Promise<boolean>;
    updateProfile: (payload: Partial<UserData>) => Promise<boolean>;
    updateWeight: (weight: number) => void;
    addWater: (amount: number) => Promise<void>;
    refreshHealth: () => Promise<void>;
    loading: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";
const TOKEN_KEY = "ft_token";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [screen, setScreen] = useState<ScreenName>("splash");
    const [userData, setUserData] = useState<UserData | null>({
        name: "Nguyen Van A",
        email: "nguyenvana@example.com",
        age: 21,
        height: 175,
        weight: 72,
        gender: "male",
        activityLevel: "moderate",
        goal: "maintain",
        dailyWaterGoal: 2000,
    });
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [healthData, setHealthData] = useState<HealthData>({
        currentWeight: 72,
        targetWeight: 68,
        bmi: 23.5,
        tdee: 2200,
        calorieGoal: 1800,
        dailyCalories: 1650,
        waterIntake: 1250,
        waterGoal: 2000,
        weightHistory: [
            { date: "Mon", weight: 73.2 },
            { date: "Tue", weight: 72.8 },
            { date: "Wed", weight: 72.6 },
            { date: "Thu", weight: 72.2 },
            { date: "Fri", weight: 72.0 },
            { date: "Sat", weight: 71.8 },
            { date: "Sun", weight: 72.0 },
        ],
        waterHistory: [
            { date: "Mon", amount: 1600 },
            { date: "Tue", amount: 1800 },
            { date: "Wed", amount: 2100 },
            { date: "Thu", amount: 1750 },
            { date: "Fri", amount: 1900 },
            { date: "Sat", amount: 2200 },
            { date: "Sun", amount: 1250 },
        ],
    });

    async function storeToken(value: string | null) {
        setToken(value);
        if (value) {
            await AsyncStorage.setItem(TOKEN_KEY, value);
        } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
        }
    }

    function resolveToken(override?: string | null) {
        return override || token;
    }

    async function fetchWithAuth(path: string, opts: RequestInit = {}) {
        const headers = new Headers(opts.headers ?? {});
        const authToken = resolveToken();

        if (authToken) {
            headers.set("Authorization", `Bearer ${authToken}`);
        }

        try {
            return await fetch(`${API_BASE_URL}${path}`, {
                ...opts,
                headers,
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error("fetchWithAuth error", error);
            return null;
        }
    }

    async function fetchProfile(overrideToken?: string | null) {
        try {
            const headers = new Headers();
            const authToken = resolveToken(overrideToken);

            if (authToken) {
                headers.set("Authorization", `Bearer ${authToken}`);
            }

            const res = await fetch(`${API_BASE_URL}/api/auth/me`, { headers });
            if (!res.ok) {
                return null;
            }

            const body = (await res.json()) as any;
            if (body && body.data) {
                setUserData({
                    name: body.data.fullName || body.data.name || "",
                    email: body.data.email,
                    age: body.data.age ?? 18,
                    height: body.data.height ?? 170,
                    weight: body.data.weight ?? 70,
                    gender: body.data.gender ?? "male",
                    activityLevel: body.data.activityLevel ?? "moderate",
                    goal: body.data.goal ?? "maintain",
                    dailyWaterGoal: body.data.dailyWaterGoal ?? 2000,
                });

                return body.data;
            }

            return null;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return null;
        }
    }

    async function fetchHealth() {
        try {
            const dash = await fetchWithAuth("/api/stats/dashboard");
            const today = await fetchWithAuth("/api/water/today");

            if (dash && dash.ok) {
                const data = (await dash.json()) as any;
                const dashboard = data.data || {};

                setHealthData((current) => ({
                    ...current,
                    ...mapDashboardToHealthData(dashboard, current),
                }));
            }

            if (today && today.ok) {
                const data = (await today.json()) as any;
                setHealthData((current) => ({
                    ...current,
                    waterIntake: data.data?.totalAmount ?? data.data?.amount ?? current.waterIntake,
                }));
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }

    async function login(email: string, password: string) {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const body = (await res.json()) as any;
            if (!res.ok) {
                return false;
            }

            const nextToken = body.data?.token || body.token;
            if (nextToken) {
                await storeToken(nextToken);
            }

            const profile = await fetchProfile(nextToken);
            await fetchHealth();

            if (!profile || profile.age === undefined || profile.height === undefined || profile.weight === undefined) {
                setScreen("profile");
            } else {
                setScreen("dashboard");
            }

            return true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }

    async function register(payload: any) {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const body = (await res.json()) as any;
            if (!res.ok) {
                return false;
            }

            const nextToken = body.data?.token || body.token;
            if (nextToken) {
                await storeToken(nextToken);
            }

            const profile = await fetchProfile(nextToken);
            await fetchHealth();

            if (body.data?.profileComplete === true) {
                setScreen("dashboard");
                return true;
            }

            if (!profile || profile.age === undefined || profile.height === undefined || profile.weight === undefined) {
                setScreen("profile");
                return true;
            }

            setScreen("dashboard");
            return true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    }

    function updateWeight(weight: number) {
        setHealthData((current) => {
            const nextWeight = Number(weight.toFixed(1));
            const heightMeters = Math.max(1, (userData?.height ?? 170) / 100);
            const nextBmi = Number((nextWeight / (heightMeters * heightMeters)).toFixed(1));

            return {
                ...current,
                currentWeight: nextWeight,
                bmi: nextBmi,
                weightHistory: [...current.weightHistory.slice(-6), { date: "Now", weight: nextWeight }],
            };
        });
    }

    async function addWater(amount: number) {
        try {
            const res = await fetchWithAuth("/api/water", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            });

            if (!res || !res.ok) {
                return;
            }

            const todayRes = await fetchWithAuth("/api/water/today");
            const histRes = await fetchWithAuth("/api/water/history");

            const today = (todayRes && todayRes.ok ? await todayRes.json() : null) as any;
            const hist = (histRes && histRes.ok ? await histRes.json() : null) as any;

            const mappedHistory = hist && hist.data && Array.isArray(hist.data.logs)
                ? hist.data.logs.map((item: any) => ({ date: item.date || item.createdAt || "", amount: item.amount || item.value || 0 }))
                : [...healthData.waterHistory.slice(-6), { date: "Now", amount }];

            setHealthData((current) => ({
                ...current,
                waterIntake: (today && today.data && (today.data.totalAmount ?? today.data.amount)) || current.waterIntake + amount,
                waterHistory: mappedHistory,
            }));
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }

    async function postBmi(payload: { height: number; weight: number; bmi: number }) {
        try {
            const res = await fetchWithAuth("/api/bmi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res || !res.ok) {
                return false;
            }

            await fetchHealth();
            return true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return false;
        }
    }

    async function updateProfile(payload: Partial<UserData>) {
        try {
            const res = await fetchWithAuth("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: payload.name,
                    age: payload.age,
                    gender: payload.gender,
                    height: payload.height,
                    weight: payload.weight,
                    activityLevel: payload.activityLevel,
                    goal: payload.goal,
                    dailyWaterGoal: payload.dailyWaterGoal,
                }),
            });

            if (!res || !res.ok) {
                return false;
            }

            const body: any = await res.json();
            const updated = body?.data?.user || body?.data || {};

            setUserData((current) => ({
                name: updated.fullName || updated.name || current?.name || "",
                email: updated.email || current?.email || "",
                age: updated.age ?? current?.age ?? 18,
                height: updated.height ?? current?.height ?? 170,
                weight: updated.weight ?? current?.weight ?? 70,
                gender: updated.gender ?? current?.gender ?? "male",
                activityLevel: updated.activityLevel ?? current?.activityLevel ?? "moderate",
                goal: updated.goal ?? current?.goal ?? "maintain",
                dailyWaterGoal: updated.dailyWaterGoal ?? current?.dailyWaterGoal ?? 2000,
            }));

            if (typeof updated.height === "number" && typeof updated.weight === "number") {
                const nextBmi = Number((updated.weight / Math.pow(updated.height / 100, 2)).toFixed(1));
                setHealthData((current) => ({
                    ...current,
                    currentWeight: updated.weight,
                    bmi: nextBmi,
                }));
            }

            await fetchHealth();
            return true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return false;
        }
    }

    async function refreshHealth() {
        await fetchHealth();
    }

    function logout() {
        void AsyncStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUserData(null);
        setScreen("login");
    }

    useEffect(() => {
        let mounted = true;

        async function restoreSession() {
            const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

            if (!mounted) {
                return;
            }

            if (storedToken) {
                setToken(storedToken);
                await fetchProfile(storedToken);
                await fetchHealth();
                setScreen("dashboard");
                return;
            }

            setScreen("login");
        }

        void restoreSession();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const value: AppContextValue = {
        screen,
        setScreen,
        userData,
        healthData,
        authFetch: fetchWithAuth,
        loading,
        login,
        register,
        logout,
        postBmi,
        updateProfile,
        updateWeight,
        addWater,
        refreshHealth,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }
    return context;
}