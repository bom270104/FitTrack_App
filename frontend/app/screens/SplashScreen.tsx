"use client";

import { useEffect } from "react";
import { useApp } from "../app-context";
import { Activity } from "lucide-react";

export function SplashScreen() {
    const { setScreen } = useApp();

    useEffect(() => {
        const timer = setTimeout(() => {
            setScreen("login");
        }, 2500);
        return () => clearTimeout(timer);
    }, [setScreen]);

    return (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-secondary">
            <div className="flex flex-col items-center gap-6 animate-pulse">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary-foreground/20 backdrop-blur-sm">
                    <Activity className="h-14 w-14 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">FitTrack</h1>
                    <p className="mt-2 text-sm font-medium text-primary-foreground/80">Your Health Companion</p>
                </div>
            </div>

            <div className="absolute bottom-24 flex gap-1.5">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground/60" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground/60" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground/60" style={{ animationDelay: "300ms" }} />
            </div>
        </div>
    );
}