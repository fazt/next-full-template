"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { CornerDownLeft, LogOut, Monitor, Moon, Search, Sun } from "lucide-react";
import type { DashboardLink } from "@/config/dashboard";
import { setTheme } from "@/libs/theme";
import { cn } from "@/libs/utils";
import { NavIcon } from "./nav-icon";

type Command = {
  id: string;
  group: string;
  title: string;
  icon: React.ReactNode;
  run: () => void;
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nav: DashboardLink[];
  actions: DashboardLink[];
};

export function CommandPalette({ open, onOpenChange, nav, actions }: CommandPaletteProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // Atajo global Ctrl/Cmd + K
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Sincroniza el estado con el <dialog> nativo (atrapa el foco y cierra con Esc)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href);
    const iconClass = "size-4 text-muted-foreground";
    return [
      ...nav.map((link) => ({
        id: `nav:${link.href}`,
        group: "Navegación",
        title: link.title,
        icon: <NavIcon name={link.icon} className={iconClass} />,
        run: go(link.href),
      })),
      ...actions.map((link) => ({
        id: `action:${link.href}`,
        group: "Acciones",
        title: link.title,
        icon: <NavIcon name={link.icon} className={iconClass} />,
        run: go(link.href),
      })),
      { id: "theme:light", group: "Tema", title: "Tema claro", icon: <Sun className={iconClass} />, run: () => setTheme("light") },
      { id: "theme:dark", group: "Tema", title: "Tema oscuro", icon: <Moon className={iconClass} />, run: () => setTheme("dark") },
      { id: "theme:system", group: "Tema", title: "Tema del sistema", icon: <Monitor className={iconClass} />, run: () => setTheme("system") },
      {
        id: "account:logout",
        group: "Cuenta",
        title: "Cerrar sesión",
        icon: <LogOut className={iconClass} />,
        run: () => signOut({ callbackUrl: "/" }),
      },
    ];
  }, [nav, actions, router]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return commands;
    return commands.filter((command) => normalize(`${command.title} ${command.group}`).includes(q));
  }, [commands, query]);

  const activeIndex = Math.min(active, Math.max(filtered.length - 1, 0));

  function execute(command: Command | undefined) {
    if (!command) return;
    onOpenChange(false);
    command.run();
  }

  function move(delta: number) {
    if (filtered.length === 0) return;
    const next = (activeIndex + delta + filtered.length) % filtered.length;
    setActive(next);
    requestAnimationFrame(() =>
      document.getElementById(`cmd-${next}`)?.scrollIntoView({ block: "nearest" }),
    );
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      execute(filtered[activeIndex]);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Paleta de comandos"
      onClose={() => {
        onOpenChange(false);
        setQuery("");
        setActive(0);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
      className="mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 border-b border-border px-4">
        <Search className="size-4 text-muted-foreground" aria-hidden />
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Busca una página o acción…"
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-list"
          aria-activedescendant={filtered.length ? `cmd-${activeIndex}` : undefined}
        />
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
      </div>

      <ul id="command-list" role="listbox" className="max-h-80 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-muted-foreground">Sin resultados</li>
        )}
        {filtered.map((command, index) => (
          <li key={command.id} role="presentation">
            {(index === 0 || filtered[index - 1].group !== command.group) && (
              <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">{command.group}</p>
            )}
            <div
              id={`cmd-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseMove={() => setActive(index)}
              onClick={() => execute(command)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm",
                index === activeIndex && "bg-muted",
              )}
            >
              {command.icon}
              <span className="flex-1">{command.title}</span>
              {index === activeIndex && <CornerDownLeft className="size-3.5 text-muted-foreground" aria-hidden />}
            </div>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
