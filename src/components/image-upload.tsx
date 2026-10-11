"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/libs/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  folder: "avatars" | "products" | "misc";
  shape?: "square" | "circle";
  error?: string;
};

/** Sube una imagen a /api/uploads (disco local o S3) y devuelve su URL. */
export function ImageUpload({ value, onChange, folder, shape = "square", error }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) setUploadError(data?.error ?? "No se pudo subir la imagen");
      else onChange(data.data.url);
    } catch {
      setUploadError("No se pudo conectar con el servidor");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const message = uploadError ?? error;
  const rounded = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div className="flex items-center gap-4">
      <div className={cn("relative size-20 shrink-0 overflow-hidden border border-border bg-muted", rounded)}>
        {value ? (
          <Image src={value} alt="Vista previa" fill unoptimized sizes="80px" className="object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-muted-foreground">
            <ImageIcon className="size-6" aria-hidden />
          </span>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
            {!uploading && <Upload className="size-4" aria-hidden />}
            {value ? "Cambiar imagen" : "Subir imagen"}
          </Button>
          {value && (
            <Button variant="ghost" size="sm" onClick={() => onChange("")} disabled={uploading}>
              <X className="size-4" aria-hidden />
              Quitar
            </Button>
          )}
        </div>
        {message ? (
          <p role="alert" className="text-sm text-danger">
            {message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF o AVIF.</p>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label="Seleccionar imagen"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
        }}
      />
    </div>
  );
}
