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

    // Latest BMI entry
    const latestBmiEntry = dd?.bmi?.latest || {};

    // Latest calories entry (from CaloriesLog)
    const latestCalories = dd?.calories?.latest || {};

    const bmi = finiteOrCurrent(
        Number(latestBmiEntry.bmi ?? latestBmiEntry.weight ?? 0),
        current.bmi ?? 0,
    );

    const tdee = finiteOrCurrent(Number(latestCalories.tdee || 0), current.tdee ?? 0);

    const calorieGoal = finiteOrCurrent(
        Number(latestCalories.recommendedCalories ?? current.calorieGoal ?? 0),
        current.calorieGoal ?? 0,
    );

    const currentWeight = finiteOrCurrent(Number(latestBmiEntry.weight || latestBmiEntry.bmi || 0), current.currentWeight ?? 0);
    const targetWeight = finiteOrCurrent(Number((dd?.profile?.targetWeight ?? dd?.profile?.target_weight) || 0), current.targetWeight ?? 0);
    const waterTotal = finiteOrCurrent(Number(dd?.water?.totalAmount || 0), current.waterIntake ?? 0);
    const waterGoal = finiteOrCurrent(Number(dd?.water?.goal || 0), current.waterGoal ?? 2000);

    return {
        bmi,
        tdee,
        calorieGoal,
        currentWeight,
        targetWeight,
        weightHistory,
        waterHistory,
        waterIntake: waterTotal,
        waterGoal,
    };
}

export default mapDashboardToHealthData;
