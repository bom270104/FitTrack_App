"use client";

import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { ArrowLeft, Plus, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

const waterOptions = [
    { amount: 150, label: "150ml", icon: "🥛" },
    { amount: 250, label: "250ml", icon: "🥤" },
    { amount: 350, label: "350ml", icon: "🍶" },
    { amount: 500, label: "500ml", icon: "🫗" },
];

export function WaterTrackerScreen() {
    const { healthData, addWater, setScreen } = useApp();

    const percentage = Math.round((healthData.waterIntake / healthData.waterGoal) * 100);
    const remaining = Math.max(0, healthData.waterGoal - healthData.waterIntake);
    const waterLevel = Math.min(percentage, 100);

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="px-5 pb-4 pt-14">
                <div className="flex items-center gap-4">
                    <button onClick={() => setScreen("dashboard")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">Theo dõi nước</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="mb-8 flex flex-col items-center">
                    <div className="relative mb-4 h-56 w-40">
                        <div className="absolute inset-0 overflow-hidden rounded-b-[40px] rounded-t-lg border-4 border-secondary/30">
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-secondary to-secondary/70 transition-all duration-500 ease-out" style={{ height: `${waterLevel}%` }}>
                                <div className="absolute top-0 left-0 right-0 h-4 rounded-[100%] bg-secondary/50" />
                            </div>
                            {waterLevel > 20 && (
                                <>
                                    <div className="absolute bottom-[20%] left-[20%] h-2 w-2 animate-bounce rounded-full bg-primary-foreground/30" />
                                    <div className="absolute bottom-[40%] right-[30%] h-1.5 w-1.5 animate-bounce rounded-full bg-primary-foreground/30" style={{ animationDelay: "100ms" }} />
                                    <div className="absolute bottom-[30%] left-[40%] h-1 w-1 animate-bounce rounded-full bg-primary-foreground/30" style={{ animationDelay: "200ms" }} />
                                </>
                            )}
                        </div>
                        <Droplets className="absolute -top-2 left-1/2 h-8 w-8 -translate-x-1/2 text-secondary" />
                    </div>

                    <div className="text-center">
                        <p className="text-4xl font-bold text-foreground">{healthData.waterIntake}ml</p>
                        <p className="mt-1 text-sm text-muted-foreground">trong mục tiêu hàng ngày {healthData.waterGoal}ml</p>
                    </div>

                    <div className="mt-4 flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-secondary" />
                            <span className="text-sm font-medium text-foreground">{percentage}% hoàn thành</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-muted" />
                            <span className="text-sm text-muted-foreground">{remaining}ml còn lại</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">Thêm nhanh</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {waterOptions.map((option) => (
                            <Button key={option.amount} variant="outline" onClick={async () => await addWater(option.amount)} className="flex h-16 flex-col gap-1 rounded-xl border-border hover:border-secondary hover:bg-secondary/10">
                                <span className="text-xl">{option.icon}</span>
                                <span className="text-sm font-medium text-foreground">{option.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                <Button onClick={() => addWater(100)} className="h-14 w-full rounded-xl bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90">
                    <Plus className="mr-2 h-5 w-5" />
                    Thêm lượng tùy chỉnh
                </Button>

                <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">Nhật ký hôm nay</h3>
                    <div className="space-y-3">
                        {(() => {
                            const logs = Array.isArray(healthData.waterHistory)
                                ? healthData.waterHistory
                                : healthData.waterHistory && Array.isArray((healthData as any).waterHistory?.recentEntries)
                                    ? (healthData as any).waterHistory.recentEntries
                                    : [];

                            return logs.map((log: any, index: number) => (
                                <div key={index} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
                                            <Droplets className="h-4 w-4 text-secondary" />
                                        </div>
                                        <span className="text-sm text-muted-foreground">{log.date}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">+{log.amount}ml</span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}