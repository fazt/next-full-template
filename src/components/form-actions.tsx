import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export function FormActions({
  cancelHref,
  submitLabel,
  loading,
}: {
  cancelHref: string;
  submitLabel: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
      <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
        Cancelar
      </Link>
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </div>
  );
}
