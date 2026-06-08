"use client";

import { useState } from "react";
import { useApp } from "../app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export function LoginScreen() {
    const { setScreen, login } = useApp();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Vui lòng nhập email và mật khẩu");
            return;
        }

        try {
            const ok = await login(email, password);
            if (!ok) {
                alert("Đăng nhập thất bại");
            }
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            alert("Không thể đăng nhập. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="flex h-full flex-col bg-background px-6 pb-8 pt-16">
            <div className="mb-10 flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                    <Activity className="h-9 w-9 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">Chào mừng trở lại</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Đăng nhập để tiếp tục hành trình</p>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type="email" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-0 bg-muted pl-10" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border-0 bg-muted pl-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                        </button>
                    </div>
                </div>

                <button onClick={() => alert("Chức năng đặt lại mật khẩu chưa được hỗ trợ. Vui lòng liên hệ hỗ trợ.")} className="self-end text-sm font-medium text-primary">
                    Quên mật khẩu?
                </button>

                <Button onClick={handleLogin} className="mt-4 h-14 rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="my-4 flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-sm text-muted-foreground">hoặc tiếp tục với</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => alert("Google login is not implemented in this demo.")} className="h-12 flex-1 rounded-xl border-border">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    </Button>
                    <Button variant="outline" onClick={() => alert("Apple login is not implemented in this demo.")} className="h-12 flex-1 rounded-xl border-border">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                        </svg>
                    </Button>
                </div>
            </div>

            <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">Chưa có tài khoản? </span>
                <button onClick={() => setScreen("register")} className="text-sm font-semibold text-primary">Đăng ký</button>
            </div>
        </div>
    );
}