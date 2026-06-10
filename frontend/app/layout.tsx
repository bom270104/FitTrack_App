import type { ReactNode } from "react";
import { AppProvider } from "./app-context";

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <AppProvider>{children}</AppProvider>
    );
}