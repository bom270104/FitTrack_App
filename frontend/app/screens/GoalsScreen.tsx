"use client";

import { useState } from "react";
import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { ArrowLeft, Target, Plus, Check, Flame, Droplets, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Goal {
    id: string;
    title: string;
    target: string;
    current: number;
    max: number;
    unit: string;
    icon: typeof Target;
    color: string;
    completed: boolean;
}

export function GoalsScreen() {
    const { healthData, setScreen } = useApp();
    const [goals] = useState<Goal[]>([
        {
            id: "1",
            title: "Target Weight",
            target: "68 kg",
            current: 72,
            max: 72,
            unit: "kg",
            icon: Scale,
            color: "bg-primary text-primary",
            completed: false,
        },
        {
            id: "2",
            title: "Daily Water",
            target: "2,500 ml",
            current: healthData.waterIntake,
            max: healthData.waterGoal,
            unit: "ml",
            icon: Droplets,
            color: "bg-secondary text-secondary",
            completed: healthData.waterIntake >= healthData.waterGoal,
        },
        {
            id: "3",
            title: "Calorie Budget",
            target: "2,200 kcal",
            current: healthData.dailyCalories,
            max: healthData.calorieGoal,
            unit: "kcal",
            icon: Flame,
            color: "bg-accent text-accent",
            completed: healthData.dailyCalories <= healthData.calorieGoal,
        },
    ]);

    const [showAddGoal, setShowAddGoal] = useState(false);

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="px-5 pb-4 pt-14">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setScreen("dashboard")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <ArrowLeft className="h-5 w-5 text-foreground" />
                        </button>
                        <h1 className="text-xl font-bold text-foreground">Goals</h1>
                    </div>
                    <button onClick={() => setShowAddGoal(!showAddGoal)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                        <Plus className="h-5 w-5 text-primary-foreground" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="mb-6 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-primary-foreground/80">Weekly Progress</p>
                            <p className="mt-1 text-3xl font-bold text-primary-foreground">78%</p>
                        </div>
                        <div className="relative h-16 w-16">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="white" strokeWidth="3" strokeDasharray={`${78 * 0.97} 100`} strokeLinecap="round" />
                            </svg>
                            <Target className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
                        </div>
                    </div>
                    <p className="text-sm text-primary-foreground/80">You&apos;re doing great! Keep up the good work to reach your goals.</p>
                </div>

                {showAddGoal && (
                    <div className="mb-4 animate-in slide-in-from-top-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold text-foreground">Add New Goal</h3>
                        <div className="space-y-3">
                            <Input placeholder="Goal title" className="h-12 rounded-xl border-0 bg-muted" />
                            <Input placeholder="Target value" className="h-12 rounded-xl border-0 bg-muted" />
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setShowAddGoal(false)} className="h-12 flex-1 rounded-xl">Cancel</Button>
                                <Button onClick={() => setShowAddGoal(false)} className="h-12 flex-1 rounded-xl bg-primary text-primary-foreground">Add Goal</Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {goals.map((goal) => {
                        const progress = Math.round((goal.current / goal.max) * 100);
                        return (
                            <div key={goal.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${goal.color.replace("text-", "bg-")}/10`}>
                                        <goal.icon className={`h-6 w-6 ${goal.color.split(" ")[1]}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center justify-between">
                                            <h3 className="font-semibold text-foreground">{goal.title}</h3>
                                            {goal.completed && (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                                    <Check className="h-4 w-4 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="mb-3 text-sm text-muted-foreground">Target: {goal.target}</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">{goal.current} / {goal.max} {goal.unit}</span>
                                                <span className={goal.completed ? "font-semibold text-primary" : "text-muted-foreground"}>{progress}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div className={`h-full rounded-full transition-all ${goal.completed ? "bg-primary" : goal.color.split(" ")[0].replace("bg-", "bg-")}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 rounded-2xl bg-muted p-5">
                    <p className="text-center text-sm font-medium text-foreground">&quot;The only bad workout is the one that didn&apos;t happen.&quot;</p>
                    <p className="mt-2 text-center text-xs text-muted-foreground">Stay motivated!</p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}