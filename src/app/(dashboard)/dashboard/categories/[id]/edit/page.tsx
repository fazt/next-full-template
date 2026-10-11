import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/libs/prisma";
import { requireAdmin } from "@/libs/session";
import { CategoryForm } from "../../category-form";

export const metadata: Metadata = { title: "Editar categoría" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, name: true, description: true },
  });
  if (!category) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Editar categoría" description={category.name} backHref="/dashboard/categories" backLabel="Categorías" />
      <Card>
        <CardContent>
          <CategoryForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}
