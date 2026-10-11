import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/libs/prisma";
import { requireAdmin } from "@/libs/session";
import { UserForm } from "../../user-form";

export const metadata: Metadata = { title: "Editar usuario" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireAdmin();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) notFound();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Editar usuario" description={user.email} backHref="/dashboard/users" backLabel="Usuarios" />
      <Card>
        <CardContent>
          <UserForm user={user} isSelf={user.id === currentUser.id} />
        </CardContent>
      </Card>
    </div>
  );
}
