import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const base =
            "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            outline: "border border-border bg-card text-foreground hover:bg-muted",
        } as const;

        return <button ref={ref} className={cn(base, variants[variant], className)} {...props} />;
    },
);

Button.displayName = "Button";

export { Button };