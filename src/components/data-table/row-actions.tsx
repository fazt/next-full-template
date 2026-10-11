"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiRequest } from "@/libs/http";

/** Copia un texto (p. ej. el email) al portapapeles. */
export function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // El portapapeles requiere HTTPS o localhost
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground"
      onClick={copy}
      aria-label={copied ? "Copiado" : `${label}: ${value}`}
      title={copied ? "Copiado" : label}
    >
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

export function EditLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className={buttonVariants({ variant: "ghost", size: "icon", className: "size-8" })}
      aria-label="Editar"
      title="Editar"
    >
      <Pencil className="size-4" />
    </Link>
  );
}

export function DeleteButton({
  endpoint,
  confirmMessage = "¿Seguro que quieres eliminar este registro? No se puede deshacer.",
}: {
  endpoint: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  async function onDelete() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    const result = await apiRequest(endpoint, { method: "DELETE" });
    setLoading(false);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 text-danger hover:bg-danger-soft"
      onClick={onDelete}
      loading={loading}
      aria-label="Eliminar"
      title="Eliminar"
    >
      {!loading && <Trash2 className="size-4" />}
    </Button>
  );
}
