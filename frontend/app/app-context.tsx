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
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
    activityLevel?: string;
    goal?: string;
    dailyWaterGoal?: number;
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

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function normalizeUser(user: any): UserData {
    return {
        name: user.fullName || user.name || "",
        email: user.email || "",
        age: isFiniteNumber(user.age) ? user.age : undefined,
        height: isFiniteNumber(user.height) ? user.height : undefined,
        weight: isFiniteNumber(user.weight) ? user.weight : undefined,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goal: user.goal,
        dailyWaterGoal: isFiniteNumber(user.dailyWaterGoal) ? user.dailyWaterGoal : undefined,
    };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [screen, setScreen] = useState<ScreenName>("splash");
    const [userData, setUserData] = useState<UserData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [healthData, setHealthData] = useState<HealthData>({
        currentWeight: 0,
        targetWeight: 0,
        bmi: 0,
        tdee: 0,
        calorieGoal: 0,
        dailyCalories: 0,
        waterIntake: 0,
        waterGoal: 0,
        weightHistory: [],
        waterHistory: [],
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

    async function fetchWithAuth(path: string, opts: RequestInit = {}, overrideToken?: string | null) {
        const headers = new Headers(opts.headers ?? {});
        const authToken = resolveToken(overrideToken);

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
            const user = body?.data?.user ?? body?.data;

            if (user) {
                setUserData(normalizeUser(user));

                if (isFiniteNumber(user.weight)) {
                    setHealthData((current) => ({
                        ...current,
                        currentWeight: user.weight,
                    }));
                }

                return user;
            }

            return null;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return null;
        }
    }

    async function fetchHealth(overrideToken?: string | null) {
        try {
            const dash = await fetchWithAuth("/api/stats/dashboard", {}, overrideToken);
            const today = await fetchWithAuth("/api/water/today", {}, overrideToken);

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
                    waterIntake: data.data?.totalAmount ?? data.data?.amount ?? 0,
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

            const loginUserData = body.data?.user || body.user;
            if (loginUserData) {
                setUserData(normalizeUser(loginUserData));
            }

            await fetchProfile(nextToken);
            await fetchHealth(nextToken);
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

    async function register(payload: any) {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            await res.json();
            if (!res.ok) {
                return false;
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

    function updateWeight(weight: number) {
        setHealthData((current) => {
            const nextWeight = Number(weight.toFixed(1));
            const heightMeters = (userData?.height ?? 0) / 100;
            if (heightMeters <= 0) {
                return {
                    ...current,
                    currentWeight: nextWeight,
                    weightHistory: [...current.weightHistory.slice(-6), { date: "Now", weight: nextWeight }],
                };
            }
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
                age: isFiniteNumber(updated.age) ? updated.age : current?.age,
                height: isFiniteNumber(updated.height) ? updated.height : current?.height,
                weight: isFiniteNumber(updated.weight) ? updated.weight : current?.weight,
                gender: updated.gender ?? current?.gender,
                activityLevel: updated.activityLevel ?? current?.activityLevel,
                goal: updated.goal ?? current?.goal,
                dailyWaterGoal: isFiniteNumber(updated.dailyWaterGoal) ? updated.dailyWaterGoal : current?.dailyWaterGoal,
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
        setHealthData({
            currentWeight: 0,
            targetWeight: 0,
            bmi: 0,
            tdee: 0,
            calorieGoal: 0,
            dailyCalories: 0,
            waterIntake: 0,
            waterGoal: 0,
            weightHistory: [],
            waterHistory: [],
        });
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
                await fetchHealth(storedToken);
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
