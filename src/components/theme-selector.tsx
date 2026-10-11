"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { setTheme, useTheme, type Theme } from "@/libs/theme";
import { cn } from "@/libs/utils";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function ThemeSelector() {
  const theme = useTheme();

  return (
    <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-3">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
            theme === value
              ? "border-primary bg-accent font-medium text-accent-foreground"
              : "border-border hover:bg-muted",
          )}
        >
          <Icon className="size-5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
