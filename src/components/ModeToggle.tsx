"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <div className="fixed top-6 right-6 z-50">
            <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-3 border-2 border-foreground bg-background sketch-border text-foreground hover:bg-primary hover:text-primary-foreground hover:p5-shadow hover:-translate-y-1 transition-all group flex items-center justify-center p5-skew"
                title="Toggle theme"
            >
                <Sun className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </button>
        </div>
    )
}
