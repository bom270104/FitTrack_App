"use client";

import { useApp } from "../app-context";
import { useState } from "react";
import { BottomNav } from "../bottom-nav";
import NotificationSettings from "../components/NotificationSettings";
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Ruler, Weight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const menuItems = [
    { icon: Bell, label: "Thông báo", action: "notifications" },
    { icon: Moon, label: "Giao diện tối", action: "darkmode", toggle: true },
    { icon: Shield, label: "Quyền riêng tư", action: "privacy" },
    { icon: HelpCircle, label: "Trợ giúp", action: "help" },
    { icon: Settings, label: "Cài đặt ứng dụng", action: "settings" },
];

export function ProfileScreen() {
    const { userData, healthData, setScreen, updateProfile, logout } = useApp();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [activeInfo, setActiveInfo] = useState<{ title: string; body: string } | null>(null);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: userData?.name ?? "",
        age: String(userData?.age ?? ""),
        height: String(userData?.height ?? ""),
        weight: String(userData?.weight ?? ""),
        gender: userData?.gender ?? "male",
        activityLevel: userData?.activityLevel ?? "moderate",
        goal: userData?.goal ?? "maintain",
        dailyWaterGoal: String(userData?.dailyWaterGoal ?? 2000),
    });
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

    const openEditProfile = () => {
        setProfileForm({
            name: userData?.name ?? "",
            age: String(userData?.age ?? ""),
            height: String(userData?.height ?? ""),
            weight: String(userData?.weight ?? ""),
            gender: userData?.gender ?? "male",
            activityLevel: userData?.activityLevel ?? "moderate",
            goal: userData?.goal ?? "maintain",
            dailyWaterGoal: String(userData?.dailyWaterGoal ?? 2000),
        });
        setProfileError(null);
        setProfileSuccess(null);
        setShowEditProfile(true);
    };

    const saveProfile = async () => {
        setProfileError(null);
        setProfileSuccess(null);

        const ok = await updateProfile({
            name: profileForm.name,
            age: Number(profileForm.age),
            height: Number(profileForm.height),
            weight: Number(profileForm.weight),
            gender: profileForm.gender,
            activityLevel: profileForm.activityLevel,
            goal: profileForm.goal,
            dailyWaterGoal: Number(profileForm.dailyWaterGoal),
        });

        if (!ok) {
            setProfileError("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
            return;
        }

        setProfileSuccess("Đã cập nhật hồ sơ thành công.");
        setShowEditProfile(false);
    };

    const userStats = [
        { icon: Ruler, label: "Chiều cao", value: `${userData?.height ?? "-"} cm` },
        { icon: Weight, label: "Cân nặng", value: `${healthData.currentWeight ?? "-"} kg` },
        { icon: Calendar, label: "Tuổi", value: `${userData?.age ?? "-"} tuổi` },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="flex h-full flex-col bg-background">
            <div className="px-5 pb-4 pt-14">
                <h1 className="text-xl font-bold text-foreground">Hồ sơ</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="mb-6 rounded-3xl bg-gradient-to-br from-primary to-secondary p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/20">
                            <User className="h-10 w-10 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-primary-foreground">{userData?.name ?? ""}</h2>
                            <p className="text-sm text-primary-foreground/80">{userData?.email ?? ""}</p>
                            <button onClick={openEditProfile} className="mt-2 rounded-full bg-primary-foreground/20 px-4 py-1.5 text-xs font-medium text-primary-foreground">
                                Chỉnh sửa hồ sơ
                            </button>
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
                            <h3 className="text-sm font-semibold text-foreground">Mục tiêu của tôi</h3>
                            <p className="mt-1 text-xs text-muted-foreground">3 mục tiêu đang hoạt động</p>
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
                        <button
                            key={item.action}
                            onClick={() => {
                                if (item.action === "notifications") {
                                    setShowNotifications(true);
                                    return;
                                }
                                if (item.action === "privacy") {
                                    setActiveInfo({
                                        title: "Quyền riêng tư",
                                        body: "Dữ liệu hồ sơ của bạn được lưu trữ an toàn trên backend của FitTrack. Xác thực bằng token bảo vệ các tuyến riêng tư.",
                                    });
                                    return;
                                }
                                if (item.action === "help") {
                                    setActiveInfo({
                                        title: "Trợ giúp",
                                        body: "Sử dụng Dashboard để tổng quan, BMI để tính chỉ số cơ thể, Water để ghi lại lượng uống và Thống kê để xem xu hướng.",
                                    });
                                    return;
                                }
                                if (item.action === "settings") {
                                    setActiveInfo({
                                        title: "Cài đặt ứng dụng",
                                        body: "Bản demo hiện hỗ trợ hồ sơ, cài đặt thông báo và theo dõi sức khỏe. Chế độ tối được giữ như một tuỳ chọn giao diện cục bộ.",
                                    });
                                    return;
                                }
                                if (item.action === "darkmode") {
                                    setDarkModeEnabled((current) => !current);
                                }
                            }}
                            className={`flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/50 ${index !== menuItems.length - 1 ? "border-b border-border" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                                    <item.icon className="h-4 w-4 text-foreground" />
                                </div>
                                <span className="text-sm font-medium text-foreground">{item.label}</span>
                            </div>
                            {item.toggle ? (
                                <div className="relative h-6 w-11 rounded-full bg-muted">
                                    <div className={`absolute top-1 h-4 w-4 rounded-full bg-muted-foreground transition-all ${darkModeEnabled ? "left-6" : "left-1"}`} />
                                </div>
                            ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                        </button>
                    ))}
                </div>
                {showNotifications && <NotificationSettings onClose={() => setShowNotifications(false)} />}

                {activeInfo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
                            <h3 className="mb-3 text-lg font-semibold text-foreground">{activeInfo.title}</h3>
                            <p className="text-sm text-muted-foreground">{activeInfo.body}</p>
                            <div className="mt-5 flex justify-end">
                                <button onClick={() => setActiveInfo(null)} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Chỉnh sửa hồ sơ</h3>
                            <div className="space-y-3">
                                <Input value={profileForm.name} onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))} placeholder="Họ và tên" className="h-12 rounded-xl border-0 bg-muted" />
                                <p className="text-xs text-muted-foreground">Email chỉ đọc và theo thông tin đăng ký tài khoản.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input value={profileForm.age} onChange={(e) => setProfileForm((current) => ({ ...current, age: e.target.value }))} placeholder="Tuổi" type="number" className="h-12 rounded-xl border-0 bg-muted" />
                                    <Input value={profileForm.height} onChange={(e) => setProfileForm((current) => ({ ...current, height: e.target.value }))} placeholder="Chiều cao (cm)" type="number" className="h-12 rounded-xl border-0 bg-muted" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input value={profileForm.weight} onChange={(e) => setProfileForm((current) => ({ ...current, weight: e.target.value }))} placeholder="Cân nặng (kg)" type="number" className="h-12 rounded-xl border-0 bg-muted" />
                                    <Input value={profileForm.dailyWaterGoal} onChange={(e) => setProfileForm((current) => ({ ...current, dailyWaterGoal: e.target.value }))} placeholder="Mục tiêu nước (ml)" type="number" className="h-12 rounded-xl border-0 bg-muted" />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <select value={profileForm.gender} onChange={(e) => setProfileForm((current) => ({ ...current, gender: e.target.value }))} className="h-12 rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                                        {genderOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <select value={profileForm.activityLevel} onChange={(e) => setProfileForm((current) => ({ ...current, activityLevel: e.target.value }))} className="h-12 rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                                        {activityOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <select value={profileForm.goal} onChange={(e) => setProfileForm((current) => ({ ...current, goal: e.target.value }))} className="h-12 rounded-xl border border-border bg-muted px-3 text-sm outline-none">
                                        {goalOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {profileError && <p className="mt-3 text-sm text-destructive">{profileError}</p>}
                            {profileSuccess && <p className="mt-3 text-sm text-primary">{profileSuccess}</p>}

                            <div className="mt-5 flex gap-3">
                                <Button variant="outline" onClick={() => setShowEditProfile(false)} className="h-12 flex-1 rounded-xl border-border">
                                    Hủy
                                </Button>
                                <Button onClick={saveProfile} className="h-12 flex-1 rounded-xl bg-primary text-primary-foreground">
                                    Lưu
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 p-4 font-medium text-destructive">
                    <LogOut className="h-5 w-5" />
                    <span>Đăng xuất</span>
                </button>

                <p className="mt-6 text-center text-xs text-muted-foreground">FitTrack v1.0.0</p>
            </div>

            <BottomNav />
        </div>
    );
}