"use client";

import { Home, BarChart3, Droplets, User, Target } from "lucide-react";

import { useApp, type ScreenName } from "./app-context";

const items: Array<{ key: ScreenName; label: string; icon: typeof Home }> = [
    { key: "dashboard", label: "Home", icon: Home },
    { key: "bmi", label: "BMI", icon: Target },
    { key: "water", label: "Water", icon: Droplets },
    { key: "statistics", label: "Stats", icon: BarChart3 },
    { key: "profile", label: "Profile", icon: User },
];

export function BottomNav() {
    const { screen, setScreen } = useApp();

    return (
        <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[430px] border-t border-border bg-card/90 backdrop-blur-xl">
            <div className="grid grid-cols-5 gap-1 px-3 py-2">
                {items.map((item) => {
                    const active = screen === item.key;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.key}
                            onClick={() => setScreen(item.key)}
                            className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}