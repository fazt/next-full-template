import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Package, Tags, Users, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, Badge } from "@/components/ui/feedback";
import prisma from "@/libs/prisma";
import { requireUser } from "@/libs/session";
import { formatDate, formatPrice } from "@/libs/utils";

export const metadata: Metadata = { title: "Inicio" };

const LOW_STOCK = 5;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const isAdmin = user.role === "ADMIN";

  const [productCount, categoryCount, userCount, lowStockCount, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    isAdmin ? prisma.user.count() : Promise.resolve(null),
    prisma.product.count({ where: { stock: { lt: LOW_STOCK } } }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
  ]);

  const stats: { label: string; value: number; icon: LucideIcon; href: string }[] = [
    { label: "Productos", value: productCount, icon: Package, href: "/dashboard/products" },
    { label: "Categorías", value: categoryCount, icon: Tags, href: "/dashboard/categories" },
    { label: `Stock bajo (< ${LOW_STOCK})`, value: lowStockCount, icon: AlertTriangle, href: "/dashboard/products?sort=stock&order=asc" },
  ];
  if (userCount !== null) stats.push({ label: "Usuarios", value: userCount, icon: Users, href: "/dashboard/users" });

  return (
    <>
      <PageHeader
        title={`Hola, ${user.name?.split(" ")[0] ?? "de nuevo"}`}
        description="Este es el resumen de tu aplicación."
        actions={
          isAdmin && (
            <Link href="/dashboard/products/new" className={buttonVariants()}>
              Nuevo producto
            </Link>
          )
        }
      />

      {denied && (
        <Alert tone="warning" className="mb-6">
          No tienes permisos para acceder a esa sección.
        </Alert>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className="block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/40">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {label}
                <Icon className="size-4" aria-hidden />
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            </Link>
          </li>
        ))}
      </ul>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos recientes</CardTitle>
          <Link href="/dashboard/products" className="text-sm text-primary hover:underline">
            Ver todos
          </Link>
        </CardHeader>
        <CardContent>
          {recentProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay productos.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="text-muted-foreground">
                      {product.category?.name ?? "Sin categoría"} · {formatDate(product.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {product.stock < LOW_STOCK && <Badge tone="warning">Stock {product.stock}</Badge>}
                    <span className="font-medium tabular-nums">{formatPrice(product.price)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
