// Map backend dashboard response to frontend HealthData partial shape
export function mapDashboardToHealthData(dashboard: any, current: any) {
    const dd = dashboard || {};

    // weight history from bmi.recentEntries -> [{date, weight}]
    const weightHistory = Array.isArray(dd?.bmi?.recentEntries)
        ? dd.bmi.recentEntries.map((e: any) => ({ date: e.date || e.createdAt || "", weight: e.weight ?? e.bmi ?? 0 }))
        : [];

    // water history from water.recentEntries -> [{date, amount}]
    const waterHistory = Array.isArray(dd?.water?.recentEntries)
        ? dd.water.recentEntries.map((e: any) => ({ date: e.date || e.createdAt || "", amount: e.amount ?? 0 }))
        : [];

    const bmi = typeof dd?.bmi === "number" ? dd.bmi : dd?.bmi?.latest?.bmi ?? 0;

    const tdee = dd?.tdee ?? 0;
    const calorieGoal = dd?.calorieGoal ?? 0;
    const currentWeight = dd?.currentWeight ?? 0;
    const waterTotal = dd?.water?.totalAmount ?? 0;

    return {
        bmi,
        tdee,
        calorieGoal,
        currentWeight,
        weightHistory,
        waterHistory,
        waterIntake: waterTotal,
    };
}

export default mapDashboardToHealthData;
