import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import mapDashboardToHealthData from "./utils/statsMapper";

export type ScreenName =
    | "splash"
    | "login"
    | "register"
    | "onboarding"
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
    targetWeight?: number;
    gender?: string;
    activityLevel?: string;
    goal?: string;
    dailyWaterGoal?: number;
    profileComplete?: boolean;
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
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    weightHistory: WeightPoint[];
    waterHistory: WaterPoint[];
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type FoodSearchResult = {
    _id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: number;
    category?: string;
};

export type MealFoodItem = {
    foodId: string;
    name: string;
    weightGrams: number;
    totalCalories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export type MealGroup = {
    logId: string | null;
    mealType: MealType;
    foods: MealFoodItem[];
    totalCalories: number;
    protein: number;
    carbs: number;
    fat: number;
};

export type TodayMeals = Record<MealType, MealGroup>;

type AppContextValue = {
    screen: ScreenName;
    setScreen: (screen: ScreenName) => void;
    userData: UserData | null;
    healthData: HealthData;
    todayMeals: TodayMeals;
    mealTotals: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    authFetch: (path: string, opts?: RequestInit) => Promise<Response | null>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (payload: any) => Promise<boolean>;
    logout: () => void;
    postBmi: (payload: { height: number; weight: number; bmi: number }) => Promise<boolean>;
    updateProfile: (payload: Partial<UserData>) => Promise<boolean>;
    updateWeight: (weight: number) => void;
    updateCaloriesResult: (payload: { tdee: number; calorieGoal: number; bmr?: number }) => void;
    addWater: (amount: number) => Promise<void>;
    refreshHealth: () => Promise<void>;
    refreshProfile: (overrideToken?: string | null) => Promise<boolean>;
    searchFoods: (query: string) => Promise<FoodSearchResult[]>;
    logMeal: (mealType: MealType, foodId: string, weight: number) => Promise<boolean>;
    fetchTodayMeals: (overrideToken?: string | null) => Promise<void>;
    deleteLoggedFood: (logId: string, foodId: string) => Promise<boolean>;
    loading: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_API_BASE_URL = Platform.select({
    android: "https://calibrate-ecosphere-platonic.ngrok-free.dev",
    ios: "http://localhost:5000",
    default: "http://localhost:5000",
});
const API_BASE_URL = process.env.API_BASE_URL || DEFAULT_API_BASE_URL;
const TOKEN_KEY = "ft_token";
const DEFAULT_WATER_GOAL = 2000;

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
        targetWeight: isFiniteNumber(user.targetWeight) ? user.targetWeight : isFiniteNumber(user.target_weight) ? user.target_weight : undefined,
        gender: user.gender,
        activityLevel: user.activityLevel,
        goal: user.goal,
        dailyWaterGoal: isFiniteNumber(user.dailyWaterGoal) ? user.dailyWaterGoal : undefined,
        profileComplete: user.profileComplete === true,
    };
}

function createEmptyMealGroup(mealType: MealType): MealGroup {
    return {
        logId: null,
        mealType,
        foods: [],
        totalCalories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
    };
}

function createEmptyMeals(): TodayMeals {
    return {
        breakfast: createEmptyMealGroup("breakfast"),
        lunch: createEmptyMealGroup("lunch"),
        dinner: createEmptyMealGroup("dinner"),
        snack: createEmptyMealGroup("snack"),
    };
}

function calculateBmi(height?: number, weight?: number) {
    if (!isFiniteNumber(height) || !isFiniteNumber(weight) || height <= 0) {
        return 0;
    }

    return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
}

function shouldShowOnboarding(user: any) {
    if (user?.profileComplete === true) {
        return false;
    }

    return !user?.gender || !user?.age || !user?.height || !user?.weight || !user?.activityLevel || !user?.goal;
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
        waterGoal: DEFAULT_WATER_GOAL,
        proteinGoal: 0,
        carbsGoal: 0,
        fatGoal: 0,
        weightHistory: [],
        waterHistory: [],
    });
    const [todayMeals, setTodayMeals] = useState<TodayMeals>(createEmptyMeals());

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

            let targetWeightFromProfile: number | undefined;
            let calorieGoalFromProfile: number | undefined;
            let tdeeFromProfile: number | undefined;
            let bmrFromProfile: number | undefined;
            if (authToken) {
                const profileRes = await fetch(`${API_BASE_URL}/api/onboarding/profile`, { headers });
                if (profileRes && profileRes.ok) {
                    const profileBody = (await profileRes.json()) as any;
                    const profile = profileBody?.data?.profile;
                    const targetFromProfile = profile?.targetWeight ?? profile?.target_weight;
                    const calorieGoalValue = profile?.calorieGoal ?? profile?.calorie_goal;
                    const tdeeValue = profile?.tdee ?? profile?.tdee;
                    const bmrValue = profile?.bmr ?? profile?.bmr;

                    if (isFiniteNumber(targetFromProfile)) {
                        targetWeightFromProfile = targetFromProfile;
                    }
                    if (isFiniteNumber(calorieGoalValue)) {
                        calorieGoalFromProfile = calorieGoalValue;
                    }
                    if (isFiniteNumber(tdeeValue)) {
                        tdeeFromProfile = tdeeValue;
                    }
                    if (isFiniteNumber(bmrValue)) {
                        bmrFromProfile = bmrValue;
                    }
                }
            }

            if (user) {
                setUserData(normalizeUser(user));

                setHealthData((current) => {
                    const nextWeight = isFiniteNumber(user.weight) ? user.weight : current.currentWeight;
                    const nextHeight = isFiniteNumber(user.height) ? user.height : undefined;
                    const nextBmi = calculateBmi(nextHeight, nextWeight) || current.bmi;
                    const nextTargetWeight =
                        targetWeightFromProfile ??
                        (isFiniteNumber(user.targetWeight) ? user.targetWeight : isFiniteNumber(user.target_weight) ? user.target_weight : current.targetWeight);

                    return {
                        ...current,
                        currentWeight: nextWeight,
                        targetWeight: nextTargetWeight,
                        waterGoal: isFiniteNumber(user.dailyWaterGoal) ? user.dailyWaterGoal : current.waterGoal,
                        bmi: nextBmi,
                        calorieGoal: calorieGoalFromProfile ?? current.calorieGoal,
                        tdee: tdeeFromProfile ?? current.tdee,
                        // keep current dailyCalories, protein/carbs/fat goals until dashboard loads
                    };
                });

                return user;
            }

            return null;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return null;
        }
    }

    async function refreshProfile(overrideToken?: string | null) {
        const user = await fetchProfile(overrideToken);
        return Boolean(user);
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

    async function fetchTodayMeals(overrideToken?: string | null) {
        const res = await fetchWithAuth("/api/meals/today", {}, overrideToken);

        if (!res || !res.ok) {
            const nextMeals = createEmptyMeals();

            setTodayMeals(nextMeals);
            setHealthData((current) => ({ ...current, dailyCalories: 0 }));
            return;
        }

        const body = (await res.json()) as any;
        const meals = body.data?.meals ?? {};
        const nextMeals: TodayMeals = {
            breakfast: {
                logId: meals.breakfast?.logId ?? null,
                mealType: "breakfast" as MealType,
                foods: Array.isArray(meals.breakfast?.foods) ? meals.breakfast.foods : [],
                totalCalories: Number(meals.breakfast?.totalCalories ?? 0),
                protein: Number(meals.breakfast?.protein ?? 0),
                carbs: Number(meals.breakfast?.carbs ?? 0),
                fat: Number(meals.breakfast?.fat ?? 0),
            },
            lunch: {
                logId: meals.lunch?.logId ?? null,
                mealType: "lunch" as MealType,
                foods: Array.isArray(meals.lunch?.foods) ? meals.lunch.foods : [],
                totalCalories: Number(meals.lunch?.totalCalories ?? 0),
                protein: Number(meals.lunch?.protein ?? 0),
                carbs: Number(meals.lunch?.carbs ?? 0),
                fat: Number(meals.lunch?.fat ?? 0),
            },
            dinner: {
                logId: meals.dinner?.logId ?? null,
                mealType: "dinner" as MealType,
                foods: Array.isArray(meals.dinner?.foods) ? meals.dinner.foods : [],
                totalCalories: Number(meals.dinner?.totalCalories ?? 0),
                protein: Number(meals.dinner?.protein ?? 0),
                carbs: Number(meals.dinner?.carbs ?? 0),
                fat: Number(meals.dinner?.fat ?? 0),
            },
            snack: {
                logId: meals.snack?.logId ?? null,
                mealType: "snack" as MealType,
                foods: Array.isArray(meals.snack?.foods) ? meals.snack.foods : [],
                totalCalories: Number(meals.snack?.totalCalories ?? 0),
                protein: Number(meals.snack?.protein ?? 0),
                carbs: Number(meals.snack?.carbs ?? 0),
                fat: Number(meals.snack?.fat ?? 0),
            },
        };

        setTodayMeals(nextMeals);

        try {
            const total = Object.values(nextMeals).reduce((s, g: any) => s + (Number(g.totalCalories) || 0), 0);
            setHealthData((current) => ({ ...current, dailyCalories: total }));
        } catch (err) {
            // noop
        }
    }

    async function searchFoods(query: string) {
        if (!query.trim()) {
            return [];
        }

        const res = await fetchWithAuth(`/api/foods/search?q=${encodeURIComponent(query.trim())}`);
        if (!res || !res.ok) {
            return [];
        }

        const body = (await res.json()) as any;
        return Array.isArray(body.data?.foods) ? body.data.foods : [];
    }

    async function logMeal(mealType: MealType, foodId: string, weight: number) {
        try {
            const res = await fetchWithAuth("/api/meals/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mealType, foodId, weightGrams: weight }),
            });

            if (!res || !res.ok) {
                return false;
            }

            await fetchTodayMeals();
            return true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return false;
        }
    }

    async function deleteLoggedFood(logId: string, foodId: string) {
        try {
            const res = await fetchWithAuth(`/api/meals/${logId}/food/${foodId}`, {
                method: "DELETE",
            });

            if (!res || !res.ok) {
                return false;
            }

            await fetchTodayMeals();
            return true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return false;
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
            await fetchTodayMeals(nextToken);

            const profileComplete = body.data?.profileComplete ?? shouldShowOnboarding(loginUserData || {}) === false;
            setScreen(profileComplete ? "dashboard" : "onboarding");

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

    function updateCaloriesResult(payload: { tdee: number; calorieGoal: number; bmr?: number }) {
        const calorieGoal = payload.calorieGoal;
        const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
        const carbsGoal = Math.round((calorieGoal * 0.45) / 4);
        const fatGoal = Math.round((calorieGoal * 0.25) / 9);

        setHealthData((current) => ({
            ...current,
            tdee: payload.tdee,
            calorieGoal,
            proteinGoal,
            carbsGoal,
            fatGoal,
        }));
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
            const profilePayload = Object.fromEntries(
                Object.entries({
                    fullName: payload.name,
                    age: payload.age,
                    gender: payload.gender,
                    height: payload.height,
                    weight: payload.weight,
                    activityLevel: payload.activityLevel,
                    goal: payload.goal,
                    dailyWaterGoal: payload.dailyWaterGoal,
                }).filter(([, value]) => value !== undefined),
            );

            const res = await fetchWithAuth("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profilePayload),
            });

            if (!res || !res.ok) {
                return false;
            }

            const body: any = await res.json();
            const updated = body?.data?.user || body?.data || {};
            const bmiResult = body?.data?.bmi;

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

            setHealthData((current) => {
                const next = {
                    ...current,
                    waterGoal: isFiniteNumber(updated.dailyWaterGoal) ? updated.dailyWaterGoal : current.waterGoal,
                };

                if (isFiniteNumber(bmiResult?.bmi) && isFiniteNumber(updated.weight)) {
                    return {
                        ...next,
                        currentWeight: updated.weight,
                        bmi: bmiResult.bmi,
                    };
                }

                if (typeof updated.height === "number" && typeof updated.weight === "number") {
                    const nextBmi = calculateBmi(updated.height, updated.weight);
                    return {
                        ...next,
                        currentWeight: updated.weight,
                        bmi: nextBmi,
                    };
                }

                return next;
            });

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
        void storeToken(null);
        setUserData(null);
        setHealthData({
            currentWeight: 0,
            targetWeight: 0,
            bmi: 0,
            tdee: 0,
            calorieGoal: 0,
            dailyCalories: 0,
            waterIntake: 0,
            waterGoal: DEFAULT_WATER_GOAL,
            proteinGoal: 0,
            carbsGoal: 0,
            fatGoal: 0,
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
                const storedUser = await fetchProfile(storedToken);
                if (!storedUser) {
                    await storeToken(null);
                    setScreen("login");
                    return;
                }

                await fetchHealth(storedToken);
                await fetchTodayMeals(storedToken);
                const nextScreen = shouldShowOnboarding(storedUser) ? "onboarding" : "dashboard";
                setScreen(nextScreen);
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

    // reset daily water intake at day rollover
    useEffect(() => {
        const getDateKey = () => new Date().toISOString().slice(0, 10);
        let last = getDateKey();

        const id = setInterval(() => {
            const now = getDateKey();
            if (now !== last) {
                last = now;
                // reset local water intake and refresh server data
                setHealthData((current) => ({ ...current, waterIntake: 0, waterHistory: [] }));
                void fetchHealth();
                void fetchTodayMeals();
            }
        }, 60 * 1000);

        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mealTotals = useMemo(
        () =>
            Object.values(todayMeals).reduce(
                (acc, group) => ({
                    calories: acc.calories + group.totalCalories,
                    protein: acc.protein + group.protein,
                    carbs: acc.carbs + group.carbs,
                    fat: acc.fat + group.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 },
            ),
        [todayMeals],
    );

    const value: AppContextValue = {
        screen,
        setScreen,
        userData,
        healthData,
        todayMeals,
        mealTotals,
        authFetch: fetchWithAuth,
        loading,
        login,
        register,
        logout,
        postBmi,
        updateProfile,
        updateWeight,
        updateCaloriesResult,
        addWater,
        refreshHealth,
        refreshProfile,
        searchFoods,
        logMeal,
        fetchTodayMeals,
        deleteLoggedFood,
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
