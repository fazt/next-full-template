import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/libs/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      N
    </span>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold", className)}>
      <LogoMark />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
