"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { setTheme, useTheme, type Theme } from "@/libs/theme";
import { Button } from "@/components/ui/button";

const order: Theme[] = ["light", "dark", "system"];
const labels: Record<Theme, string> = {
  light: "Tema claro",
  dark: "Tema oscuro",
  system: "Tema del sistema",
};

export function ThemeToggle() {
  const theme = useTheme();
  const next = order[(order.indexOf(theme) + 1) % order.length];
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`${labels[theme]} (cambiar a ${labels[next].toLowerCase()})`}
      title={labels[theme]}
    >
      <Icon className="size-4" />
    </Button>
  );
}
