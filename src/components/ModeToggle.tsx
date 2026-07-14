"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <div className="fixed top-5 right-5 z-50">
            <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2 text-foreground/50 hover:text-foreground transition-colors"
                title="Toggle theme"
            >
                <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.1rem] w-[1.1rem] top-2 left-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </button>
        </div>
    )
}
