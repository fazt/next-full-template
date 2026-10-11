import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/libs/session";
import { UserForm } from "../user-form";

export const metadata: Metadata = { title: "Nuevo usuario" };

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Nuevo usuario" backHref="/dashboard/users" backLabel="Usuarios" />
      <Card>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>
    </div>
  );
}
