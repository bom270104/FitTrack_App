// Map backend dashboard response to frontend HealthData partial shape
export function mapDashboardToHealthData(dashboard: any, current: any) {
    const dd = dashboard || {};
    const finiteOrCurrent = (value: unknown, currentValue: number) =>
        typeof value === "number" && Number.isFinite(value) ? value : currentValue;

    // weight history from bmi.recentEntries -> [{date, weight}]
    const weightHistory = Array.isArray(dd?.bmi?.recentEntries)
        ? dd.bmi.recentEntries.map((e: any) => ({ date: e.date || e.createdAt || "", weight: e.weight ?? e.bmi ?? 0 }))
        : [];

    // water history from water.recentEntries -> [{date, amount}]
    const waterHistory = Array.isArray(dd?.water?.recentEntries)
        ? dd.water.recentEntries.map((e: any) => ({ date: e.date || e.createdAt || "", amount: e.amount ?? 0 }))
        : [];

    const latestBmi = typeof dd?.bmi === "number" ? dd.bmi : dd?.bmi?.latest?.bmi;

    const latestCalories = dd?.calories?.latest ?? {};

    const bmi = finiteOrCurrent(latestBmi, current.bmi ?? 0);
    const tdee = finiteOrCurrent(dd?.tdee ?? latestCalories.tdee, current.tdee ?? 0);
    const calorieGoal = finiteOrCurrent(
        dd?.calorieGoal ?? latestCalories.recommendedCalories,
        current.calorieGoal ?? 0,
    );
    const currentWeight = finiteOrCurrent(dd?.currentWeight, current.currentWeight ?? 0);
    const waterTotal = finiteOrCurrent(dd?.water?.totalAmount, current.waterIntake ?? 0);
    const waterGoal = finiteOrCurrent(dd?.waterGoal ?? dd?.water?.goal, current.waterGoal ?? 2000);

    return {
        bmi,
        tdee,
        calorieGoal,
        currentWeight,
        weightHistory,
        waterHistory,
        waterIntake: waterTotal,
        waterGoal,
    };
}

export default mapDashboardToHealthData;
