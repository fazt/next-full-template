import { Label } from "@/components/ui/input";
import { cn } from "@/libs/utils";

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/** Etiqueta + control + mensaje de error accesible. */
export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Props ARIA para enlazar un control con su mensaje de error. */
export function fieldAria(id: string, error?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;
}
