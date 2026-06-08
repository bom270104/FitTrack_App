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
                    <h1 className="text-2xl font-bold text-foreground">Tạo tài khoản</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Bắt đầu hành trình sức khỏe của bạn</p>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Họ và tên</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type="text" placeholder="Nhập tên của bạn" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl border-0 bg-muted pl-10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-0 bg-muted pl-10" />
                    </div>
                </div>

                {/* health/profile fields moved to Profile screen after login */}

                <div className="space-y-2">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type={showPassword ? "text" : "password"} placeholder="Tạo mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border-0 bg-muted pl-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                        </button>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">Bằng cách đăng ký, bạn đồng ý với <span className="text-primary">Điều khoản dịch vụ</span> và <span className="text-primary">Chính sách bảo mật</span></p>

                <Button onClick={handleRegister} className="mt-4 h-14 rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
                    Tạo tài khoản
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>

            <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">Đã có tài khoản? </span>
                <button onClick={() => setScreen("login")} className="text-sm font-semibold text-primary">Đăng nhập</button>
            </div>
        </div>
    );
}