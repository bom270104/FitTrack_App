// Map backend dashboard response to frontend HealthData partial shape
export function mapDashboardToHealthData(dashboard: any, current: any) {
    const dd = dashboard || {};

    // weight history from bmi.recentEntries -> [{date, weight}]
    const weightHistory = Array.isArray(dd?.bmi?.recentEntries)
        ? dd.bmi.recentEntries.map((e: any) => ({ date: e.date || e.createdAt || "", weight: e.weight ?? e.bmi ?? 0 }))
        : current.weightHistory || [];

    // water history from water.recentEntries -> [{date, amount}]
    const waterHistory = Array.isArray(dd?.water?.recentEntries)
        ? dd.water.recentEntries.map((e: any) => ({ date: e.date || e.createdAt || "", amount: e.amount ?? 0 }))
        : current.waterHistory || [];

    const bmi = typeof dd?.bmi === "number" ? dd.bmi : dd?.bmi?.latest?.bmi ?? current.bmi;

    const tdee = dd?.tdee ?? current.tdee;
    const calorieGoal = dd?.calorieGoal ?? current.calorieGoal;
    const currentWeight = dd?.currentWeight ?? current.currentWeight;
    const waterTotal = dd?.water?.totalAmount ?? current.waterIntake;

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
