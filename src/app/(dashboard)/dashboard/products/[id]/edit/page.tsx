import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryOptions } from "@/libs/data/catalog";
import prisma from "@/libs/prisma";
import { requireAdmin } from "@/libs/session";
import { ProductForm } from "../../product-form";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getCategoryOptions(),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Editar producto" description={product.name} backHref="/dashboard/products" backLabel="Productos" />
      <Card>
        <CardContent>
          <ProductForm
            categories={categories}
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              // Decimal no es serializable para un componente cliente
              price: Number(product.price),
              stock: product.stock,
              categoryId: product.categoryId,
              imageUrl: product.imageUrl,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
