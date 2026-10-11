import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Hecho por {siteConfig.author}.
        </p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/prices" className="hover:text-foreground">
            Precios
          </Link>
          <Link href="/about" className="hover:text-foreground">
            Acerca de
          </Link>
          <Link href="/auth/signin" className="hover:text-foreground">
            Iniciar sesión
          </Link>
          <a href={siteConfig.repoUrl} className="hover:text-foreground" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
