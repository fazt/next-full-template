import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Acerca de" };

const principles = [
  {
    title: "Una sola fuente de validación",
    description:
      "Cada formulario y su endpoint comparten el mismo esquema zod: lo que pasa en el cliente se vuelve a comprobar en el servidor.",
  },
  {
    title: "Autorización en el servidor",
    description:
      "El proxy redirige rápido usando el JWT, pero cada página y cada endpoint vuelven a leer el rol del usuario en la base de datos.",
  },
  {
    title: "Configuración por variables de entorno",
    description:
      "Google, correo, almacenamiento remoto y push se activan al definir sus variables. Sin ellas la app sigue funcionando con alternativas locales.",
  },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Acerca de {siteConfig.name}</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Una plantilla creada por {siteConfig.author} para arrancar aplicaciones full-stack con Next.js sin
        volver a escribir el login, la gestión de usuarios o la subida de archivos en cada proyecto.
      </p>

      <h2 className="mt-14 text-2xl font-semibold">Principios</h2>
      <ul className="mt-6 grid gap-4">
        {principles.map((item) => (
          <li key={item.title} className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl font-semibold">Código abierto</h2>
      <p className="mt-4 text-muted-foreground">
        El código, las instrucciones de instalación y la lista de variables de entorno están en el{" "}
        <a href={siteConfig.repoUrl} className="font-medium text-primary underline-offset-4 hover:underline">
          repositorio de GitHub
        </a>
        .
      </p>
    </section>
  );
}
