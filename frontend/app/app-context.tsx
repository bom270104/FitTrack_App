"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
    const [loading, setLoading] = useState<boolean>(false);

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

    const value = useMemo<AppContextValue>(
        () => ({
            screen,
            setScreen,
            userData,
            healthData,
            loading,
            login: async (email: string, password: string) => {
                setLoading(true);
                try {
                    const res = await fetch("http://localhost:5000/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, password }),
                    });

                    const body = await res.json();

                    if (!res.ok) {
                        setLoading(false);
                        return false;
                    }

                    const t = body.data?.token || body.token;
                    if (t) {
                        localStorage.setItem("ft_token", t);
                        setToken(t);
                    }

                    // fetch profile and initial health data
                    await fetchProfile(t);
                    await fetchHealth();

                    setLoading(false);
                    setScreen("dashboard");
                    return true;
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    setLoading(false);
                    return false;
                }
            },
            register: async (payload: any) => {
                setLoading(true);
                try {
                    const res = await fetch("http://localhost:5000/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    const body = await res.json();
                    if (!res.ok) {
                        setLoading(false);
                        return false;
                    }

                    const t = body.data?.token || body.token;
                    if (t) {
                        localStorage.setItem("ft_token", t);
                        setToken(t);
                    }

                    await fetchProfile(t);
                    await fetchHealth();

                    setLoading(false);
                    setScreen("dashboard");
                    return true;
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    setLoading(false);
                    return false;
                }
            },
            updateWeight: (weight: number) => {
                setHealthData((current) => {
                    const nextWeight = Number(weight.toFixed(1));
                    const nextBmi = Number((nextWeight / Math.pow(current.currentWeight ? userData!.height / 100 : 1, 2)).toFixed(1));

                    return {
                        ...current,
                        currentWeight: nextWeight,
                        bmi: nextBmi,
                        weightHistory: [...current.weightHistory.slice(-6), { date: "Now", weight: nextWeight }],
                    };
                });
            },
            addWater: async (amount: number) => {
                try {
                    const res = await fetchWithAuth("/api/water", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ amount }),
                    });

                    if (!res || !res.ok) {
                        return;
                    }

                    // refresh today's intake and history
                    const todayRes = await fetchWithAuth("/api/water/today");
                    const histRes = await fetchWithAuth("/api/water/history");

                    const today = todayRes && todayRes.ok ? await todayRes.json() : null;
                    const hist = histRes && histRes.ok ? await histRes.json() : null;

                    // hist.data.logs expected shape from API: { logs: [...], totalAmount }
                    const mappedHistory = hist && hist.data && Array.isArray(hist.data.logs)
                        ? hist.data.logs.map((l: any) => ({ date: l.date || l.createdAt || "", amount: l.amount || l.value || 0 }))
                        : [...healthData.waterHistory.slice(-6), { date: "Now", amount }];

                    setHealthData((current) => ({
                        ...current,
                        waterIntake: (today && today.data && (today.data.totalAmount ?? today.data.amount)) || current.waterIntake + amount,
                        waterHistory: mappedHistory,
                    }));
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                }
            },
            refreshHealth: async () => {
                await fetchHealth();
            },
            logout: () => {
                localStorage.removeItem("ft_token");
                setToken(null);
                setUserData(null);
                setScreen("login");
            },
            postBmi: async (payload: { height: number; weight: number; bmi: number }) => {
                try {
                    const res = await fetchWithAuth("/api/bmi", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    if (!res || !res.ok) return false;

                    // refresh health/stats
                    await fetchHealth();
                    return true;
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    return false;
                }
            },
            updateProfile: async (payload: Partial<UserData>) => {
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

                    if (!res || !res.ok) return false;

                    const body = await res.json();
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
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    return false;
                }
            },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [healthData, screen, userData],
    );

    // helper to include auth header
    async function fetchWithAuth(path: string, opts: RequestInit = {}) {
        const base = "http://localhost:5000";
        const headers: Record<string, string> = { ...(opts.headers as Record<string, string> || {}) };
        const t = token || localStorage.getItem("ft_token");
        if (t) headers["Authorization"] = `Bearer ${t}`;

        try {
            return await fetch(base + path, { ...opts, headers });
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("fetchWithAuth error", err);
            return null;
        }
    }

    async function fetchProfile(t?: string | null) {
        try {
            const h: Record<string, string> = {};
            const tok = t || token || localStorage.getItem("ft_token");
            if (tok) h["Authorization"] = `Bearer ${tok}`;

            const res = await fetch("http://localhost:5000/api/auth/me", { headers: h });
            if (!res.ok) return;
            const body = await res.json();
            if (body && body.data) {
                setUserData({
                    name: body.data.fullName || body.data.name || "",
                    email: body.data.email,
                    age: body.data.age || 18,
                    height: body.data.height || 170,
                    weight: body.data.weight || 70,
                    gender: body.data.gender || "male",
                    activityLevel: body.data.activityLevel || "moderate",
                    goal: body.data.goal || "maintain",
                    dailyWaterGoal: body.data.dailyWaterGoal || 2000,
                });
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
    }

    async function fetchHealth() {
        try {
            // attempt to load dashboard and water today
            const dash = await fetchWithAuth("/api/stats/dashboard");
            const today = await fetchWithAuth("/api/water/today");

            if (dash && dash.ok) {
                const data = await dash.json();
                // dashboard structure: data.data = { bmi: {...}, calories: {...}, water: {...}, ... }
                const dd = data.data || {};

                // Use central mapper to convert dashboard -> frontend health fields
                setHealthData((current) => ({
                    ...current,
                    ...mapDashboardToHealthData(dd, current),
                }));
            }

            if (today && today.ok) {
                const td = await today.json();
                setHealthData((current) => ({ ...current, waterIntake: td.data?.amount ?? current.waterIntake }));
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
    }

    // on mount try to restore token and profile
    useEffect(() => {
        const t = localStorage.getItem("ft_token");
        if (t) {
            setToken(t);
            fetchProfile(t);
            fetchHealth();
            setScreen("dashboard");
        } else {
            setScreen("login");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }

    return context;
}