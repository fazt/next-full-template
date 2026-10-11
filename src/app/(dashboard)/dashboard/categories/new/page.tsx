import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/libs/session";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Nueva categoría" };

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Nueva categoría" backHref="/dashboard/categories" backLabel="Categorías" />
      <Card>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
