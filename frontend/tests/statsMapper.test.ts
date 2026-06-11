import { describe, it, expect } from 'vitest';
import { mapDashboardToHealthData } from '../app/utils/statsMapper';

describe('mapDashboardToHealthData', () => {
    it('maps bmi.latest and water.recentEntries correctly', () => {
        const dashboard = {
            bmi: { latest: { bmi: 23.4 }, recentEntries: [{ date: '2026-01-01', weight: 70 }] },
            water: { recentEntries: [{ date: '2026-01-01', amount: 250 }], totalAmount: 500 },
            tdee: 2100,
            calorieGoal: 1800,
            currentWeight: 70,
        };
        const current = { bmi: 0, weightHistory: [], waterHistory: [], waterIntake: 0, tdee: 0, calorieGoal: 0, currentWeight: 0 };

        const out = mapDashboardToHealthData(dashboard, current);
        expect(out.bmi).toBe(23.4);
        expect(out.weightHistory).toEqual([{ date: '2026-01-01', weight: 70 }]);
        expect(out.waterHistory).toEqual([{ date: '2026-01-01', amount: 250 }]);
        expect(out.waterIntake).toBe(500);
        expect(out.tdee).toBe(2100);
    });

    it('falls back to numeric bmi and current when fields missing', () => {
        const dashboard = { bmi: 22.1 };
        const current = { bmi: 21, weightHistory: [{ date: 'x', weight: 60 }], waterHistory: [{ date: 'x', amount: 100 }], waterIntake: 100, tdee: 1800, calorieGoal: 1500, currentWeight: 60 };

        const out = mapDashboardToHealthData(dashboard, current);
        expect(out.bmi).toBe(22.1);
        expect(out.weightHistory).toEqual(current.weightHistory);
        expect(out.waterHistory).toEqual(current.waterHistory);
        expect(out.waterIntake).toBe(current.waterIntake);
        expect(out.currentWeight).toBe(current.currentWeight);
    });

    it('keeps current bmi when dashboard has no bmi value yet', () => {
        const dashboard = { bmi: { latest: null, recentEntries: [] } };
        const current = { bmi: 24.2, weightHistory: [], waterHistory: [], waterIntake: 0, tdee: 0, calorieGoal: 0, currentWeight: 70 };

        const out = mapDashboardToHealthData(dashboard, current);
        expect(out.bmi).toBe(24.2);
        expect(out.currentWeight).toBe(70);
    });

    it('maps latest calories result for home TDEE display', () => {
        const dashboard = {
            calories: {
                latest: {
                    tdee: 2400,
                    recommendedCalories: 2100,
                },
            },
        };
        const current = { bmi: 0, weightHistory: [], waterHistory: [], waterIntake: 0, tdee: 0, calorieGoal: 0, currentWeight: 0 };

        const out = mapDashboardToHealthData(dashboard, current);
        expect(out.tdee).toBe(2400);
        expect(out.calorieGoal).toBe(2100);
    });
});
