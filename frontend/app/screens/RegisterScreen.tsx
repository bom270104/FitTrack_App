"use client";

import { useState } from "react";
import { useApp } from "../app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Mail, Lock, Eye, EyeOff, User, ArrowLeft, ArrowRight } from "lucide-react";

const genderOptions = [
    { label: "Nam", value: "male" },
    { label: "Nữ", value: "female" },
    { label: "Khác", value: "other" },
];

const activityOptions = [
    { label: "Ít vận động", value: "sedentary" },
    { label: "Vận động nhẹ", value: "light" },
    { label: "Vận động vừa", value: "moderate" },
    { label: "Vận động nhiều", value: "active" },
    { label: "Rất năng động", value: "very_active" },
];

const goalOptions = [
    { label: "Tăng cân", value: "gain" },
    { label: "Giảm cân", value: "lose" },
    { label: "Giữ cân", value: "maintain" },
];

export function RegisterScreen() {
    const { setScreen, register } = useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("18");
    const [gender, setGender] = useState("male");
    const [height, setHeight] = useState("170");
    const [weight, setWeight] = useState("70");
    const [activityLevel, setActivityLevel] = useState("moderate");
    const [goal, setGoal] = useState("maintain");
    const [dailyWaterGoal, setDailyWaterGoal] = useState("2000");

    const handleRegister = async () => {
        if (!name || !email || !password) {
            alert("Please fill all required fields");
            return;
        }

        try {
            const payload = {
                fullName: name,
                email,
                password,
                age: Number(age),
                gender,
                height: Number(height),
                weight: Number(weight),
                activityLevel,
                goal,
                dailyWaterGoal: Number(dailyWaterGoal),
            };

            const ok = await register(payload);
            if (!ok) {
                alert("Registration failed");
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            alert("Unable to register. Please try again later.");
        }
    };

    return (
        <div className="flex h-full flex-col bg-background px-6 pb-8 pt-16">
            <button onClick={() => setScreen("login")} className="absolute left-6 top-16 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>

            <div className="mb-8 mt-6 flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                    <Activity className="h-9 w-9 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Start your health journey today</p>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl border-0 bg-muted pl-10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-0 bg-muted pl-10" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Age</label>
                        <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-12 rounded-xl border-0 bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Gender</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                            {genderOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Height (cm)</label>
                        <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-12 rounded-xl border-0 bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Weight (kg)</label>
                        <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-12 rounded-xl border-0 bg-muted" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Activity Level</label>
                        <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                            {activityOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Goal</label>
                        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="h-12 w-full rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                            {goalOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Daily water goal (ml)</label>
                    <Input type="number" value={dailyWaterGoal} onChange={(e) => setDailyWaterGoal(e.target.value)} className="h-12 rounded-xl border-0 bg-muted" />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border-0 bg-muted pl-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                        </button>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">By signing up, you agree to our <span className="text-primary">Terms of Service</span> and <span className="text-primary">Privacy Policy</span></p>

                <Button onClick={handleRegister} className="mt-4 h-14 rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>

            <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">Already have an account? </span>
                <button onClick={() => setScreen("login")} className="text-sm font-semibold text-primary">Sign In</button>
            </div>
        </div>
    );
}