import Link from "next/link";
import {
  Bell,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Table2,
  Upload,
  UserRoundCheck,
  type LucideIcon,
  ListChecks,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: UserRoundCheck,
    title: "Autenticación",
    description: "Email y contraseña con NextAuth. Google se activa solo si defines sus credenciales.",
  },
  {
    icon: ShieldCheck,
    title: "Roles y rutas protegidas",
    description: "Admin y usuario. El proxy de Next 16 filtra rutas y la API valida el rol en la base de datos.",
  },
  {
    icon: KeyRound,
    title: "Recuperar contraseña",
    description: "Enlace con token de un solo uso que caduca. Envío con Resend o SMTP; en desarrollo, por consola.",
  },
  {
    icon: ListChecks,
    title: "Formularios validados",
    description: "Los mismos esquemas zod en el formulario (react-hook-form) y en la API REST.",
  },
  {
    icon: Table2,
    title: "Tablas dinámicas",
    description: "Búsqueda, filtros por columna, orden y paginación resueltos en el servidor.",
  },
  {
    icon: Upload,
    title: "Subida de archivos",
    description: "Disco local o almacenamiento compatible con S3 como DigitalOcean Spaces, R2 o AWS.",
  },
  {
    icon: Smartphone,
    title: "PWA",
    description: "Instalable, con manifest, service worker y una página sin conexión.",
  },
  {
    icon: Bell,
    title: "Notificaciones push",
    description: "Web Push con claves VAPID. Sin claves, la función se desactiva sin errores.",
  },
];

const stack = ["Next.js 16", "React 19", "Prisma 7", "PostgreSQL", "Tailwind CSS 4", "NextAuth", "Zod 4", "TypeScript"];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
        <p className="mx-auto mb-5 inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Plantilla full-stack lista para producción
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Empieza tu próximo proyecto sin rehacer lo de siempre
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          {siteConfig.name} trae autenticación, roles, CRUD con tablas dinámicas, subida de archivos, PWA y
          notificaciones push, todo con Next.js, Prisma y PostgreSQL.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/auth/register" className={buttonVariants({ size: "lg" })}>
            Crear una cuenta
          </Link>
          <Link href="/auth/signin" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="features-title">
        <h2 id="features-title" className="sr-only">
          Funcionalidades
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="rounded-xl border border-border bg-card p-5">
              <span className="mb-4 grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">Stack moderno y estable</h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {stack.map((item) => (
              <li key={item} className="rounded-full border border-border bg-card px-3 py-1 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
