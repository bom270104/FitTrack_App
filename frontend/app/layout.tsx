import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./app-context";

export const metadata: Metadata = {
    title: "FitTrack",
    description: "Personal health tracking app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body>
                <AppProvider>{children}</AppProvider>
            </body>
        </html>
    );
}