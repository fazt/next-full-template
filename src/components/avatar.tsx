import Image from "next/image";
import { cn, initials } from "@/libs/utils";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
};

export function Avatar({ src, name, email, size = 32, className }: AvatarProps) {
  const style = { width: size, height: size };

  if (src) {
    return (
      // unoptimized: la imagen puede venir del disco local o de un bucket externo
      <Image
        src={src}
        alt={name ? `Avatar de ${name}` : "Avatar"}
        width={size}
        height={size}
        unoptimized
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={style}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-accent font-semibold text-accent-foreground",
        className,
      )}
      style={{ ...style, fontSize: Math.round(size * 0.38) }}
      aria-hidden
    >
      {initials(name, email)}
    </span>
  );
}
