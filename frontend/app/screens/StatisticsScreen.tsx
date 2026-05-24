"use client";

import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { ArrowLeft, TrendingDown, Droplets, Flame, Scale } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export function StatisticsScreen() {
    const { healthData, setScreen } = useApp();

    const stats = [
        { label: "Avg. Weight", value: "72.3", unit: "kg", change: "-0.8kg", positive: true, icon: Scale, color: "bg-primary/10 text-primary" },
        { label: "Avg. Water", value: "2,100", unit: "ml", change: "+200ml", positive: true, icon: Droplets, color: "bg-secondary/10 text-secondary" },
        { label: "Avg. Calories", value: "1,920", unit: "kcal", change: "-80kcal", positive: true, icon: Flame, color: "bg-accent/10 text-accent" },
        { label: "BMI Change", value: "-0.3", unit: "kg/m2", change: "This week", positive: true, icon: TrendingDown, color: "bg-chart-5/10 text-chart-5" },
    ];

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="px-5 pb-4 pt-14">
                <div className="flex items-center gap-4">
                    <button onClick={() => setScreen("dashboard")} className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <ArrowLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">Statistics</h1>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="mb-6 flex gap-2">
                    {["Week", "Month", "Year"].map((range, index) => (
                        <button key={range} className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {range}
                        </button>
                    ))}
                </div>

                <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">Weight Progress</h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={healthData.weightHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <YAxis domain={[70, 74]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={30} />
                                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: "hsl(var(--primary))" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mb-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">Water Intake</h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={healthData.waterHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={35} />
                                <Bar dataKey="amount" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-xl font-bold text-foreground">{stat.value}</span>
                                <span className="text-xs text-muted-foreground">{stat.unit}</span>
                            </div>
                            <p className={`mt-1 text-xs ${stat.positive ? "text-primary" : "text-destructive"}`}>{stat.change}</p>
                        </div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}