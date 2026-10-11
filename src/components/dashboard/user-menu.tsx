"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/feedback";

export type ShellUser = {
  name: string | null;
  email: string;
  image: string | null;
  role: "ADMIN" | "USER";
};

export function UserMenu({ user }: { user: ShellUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemClass = "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-border"
        aria-label="Menú de usuario"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={user.image} name={user.name} email={user.email} size={32} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-border bg-card p-1.5 shadow-lg"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium">{user.name ?? "Sin nombre"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <Badge tone={user.role === "ADMIN" ? "primary" : "info"} className="mt-2">
              {user.role === "ADMIN" ? "Administrador" : "Usuario"}
            </Badge>
          </div>
          <div className="my-1 h-px bg-border" />
          <Link role="menuitem" href="/dashboard/profile" className={itemClass} onClick={() => setOpen(false)}>
            <User className="size-4" aria-hidden /> Perfil
          </Link>
          <Link role="menuitem" href="/dashboard/settings" className={itemClass} onClick={() => setOpen(false)}>
            <Settings className="size-4" aria-hidden /> Ajustes
          </Link>
          <button
            role="menuitem"
            type="button"
            className={`${itemClass} text-danger`}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-4" aria-hidden /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
