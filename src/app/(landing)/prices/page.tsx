import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/libs/utils";

export const metadata: Metadata = { title: "Precios" };

// Planes de ejemplo: reemplázalos por los de tu producto.
const plans = [
  {
    name: "Starter",
    price: "Gratis",
    period: "",
    description: "Para proyectos personales y pruebas.",
    features: ["1 proyecto", "Hasta 100 usuarios", "Subida local de archivos", "Soporte de la comunidad"],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "S/ 49",
    period: "/mes",
    description: "Para productos en crecimiento.",
    features: [
      "Proyectos ilimitados",
      "Usuarios ilimitados",
      "Almacenamiento S3 / Spaces",
      "Notificaciones push",
      "Soporte por correo",
    ],
    cta: "Probar Pro",
    highlighted: true,
  },
  {
    name: "Empresa",
    price: "A medida",
    period: "",
    description: "Para equipos con necesidades específicas.",
    features: ["Todo lo de Pro", "SSO y auditoría", "Acuerdo de nivel de servicio", "Soporte dedicado"],
    cta: "Contactar",
    highlighted: false,
  },
];

export default function PricesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Precios simples</h1>
        <p className="mt-4 text-muted-foreground">
          Planes de ejemplo para mostrar la página. Cámbialos por los de tu producto.
        </p>
      </div>

      <ul className="mt-14 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <li
            key={plan.name}
            className={cn(
              "flex flex-col rounded-2xl border bg-card p-8",
              plan.highlighted ? "border-primary shadow-lg ring-1 ring-primary" : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.highlighted && (
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                  Popular
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
            <p className="mt-6">
              <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </p>
            <ul className="mt-6 grid gap-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Check className="size-4 shrink-0 text-primary" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className={buttonVariants({
                variant: plan.highlighted ? "primary" : "outline",
                className: "mt-8 w-full",
              })}
            >
              {plan.cta}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
