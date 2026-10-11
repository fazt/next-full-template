import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryOptions } from "@/libs/data/catalog";
import { requireAdmin } from "@/libs/session";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getCategoryOptions();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Nuevo producto" backHref="/dashboard/products" backLabel="Productos" />
      <Card>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
