"use client";

import { useApp } from "../app-context";
import { BottomNav } from "../bottom-nav";
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Ruler, Weight, Calendar } from "lucide-react";

const menuItems = [
    { icon: Bell, label: "Notifications", action: "notifications" },
    { icon: Moon, label: "Dark Mode", action: "darkmode", toggle: true },
    { icon: Shield, label: "Privacy & Security", action: "privacy" },
    { icon: HelpCircle, label: "Help & Support", action: "help" },
    { icon: Settings, label: "App Settings", action: "settings" },
];

export function ProfileScreen() {
    const { userData, healthData, setScreen } = useApp();

    const userStats = [
        { icon: Ruler, label: "Height", value: `${userData.height} cm` },
        { icon: Weight, label: "Weight", value: `${healthData.currentWeight} kg` },
        { icon: Calendar, label: "Age", value: `${userData.age} years` },
    ];

    const handleLogout = () => {
        setScreen("login");
    };

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="px-5 pb-4 pt-14">
                <h1 className="text-xl font-bold text-foreground">Profile</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="mb-6 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/20">
                            <User className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-primary-foreground">{userData.name}</h2>
                            <p className="text-sm text-primary-foreground/80">{userData.email}</p>
                            <button className="mt-2 rounded-full bg-primary-foreground/20 px-4 py-1.5 text-xs font-medium text-primary-foreground">Edit Profile</button>
                        </div>
                    </div>
                </div>

                <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex justify-around">
                        {userStats.map((stat) => (
                            <div key={stat.label} className="flex flex-col items-center">
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <stat.icon className="h-5 w-5 text-primary" />
                                </div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={() => setScreen("goals")} className="mb-4 w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">My Goals</h3>
                            <p className="mt-1 text-xs text-muted-foreground">3 active goals</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">78%</span>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full w-[78%] rounded-full bg-primary" />
                    </div>
                </button>

                <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    {menuItems.map((item, index) => (
                        <button key={item.action} className={`flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50 ${index !== menuItems.length - 1 ? "border-b border-border" : ""}`}>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                                    <item.icon className="h-4 w-4 text-foreground" />
                                </div>
                                <span className="text-sm font-medium text-foreground">{item.label}</span>
                            </div>
                            {item.toggle ? (
                                <div className="relative h-6 w-11 rounded-full bg-muted">
                                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-muted-foreground transition-all" />
                                </div>
                            ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                        </button>
                    ))}
                </div>

                <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 p-4 font-medium text-destructive">
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
                </button>

                <p className="mt-6 text-center text-xs text-muted-foreground">FitTrack v1.0.0</p>
            </div>

            <BottomNav />
        </div>
    );
}