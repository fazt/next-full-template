import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { CopyButton, DeleteButton, EditLink } from "@/components/data-table/row-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";
import { listUsers, userTable } from "@/libs/data/catalog";
import { requireAdmin } from "@/libs/session";
import { parseTableState, type SearchParams } from "@/libs/table";
import { formatDate } from "@/libs/utils";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const currentUser = await requireAdmin();
  const state = parseTableState(await searchParams, userTable);
  const { rows, total, page } = await listUsers(state);

  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Nombre",
      sortable: true,
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar src={user.image} name={user.name} email={user.email} size={32} />
          <span className="font-medium">
            {user.name ?? "Sin nombre"}
            {user.id === currentUser.id && <span className="ml-1.5 text-xs text-muted-foreground">(tú)</span>}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Correo",
      sortable: true,
      cell: (user) => (
        <div className="flex items-center gap-1">
          <span>{user.email}</span>
          <CopyButton value={user.email} label="Copiar correo" />
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      sortable: true,
      cell: (user) => (
        <Badge tone={user.role === "ADMIN" ? "primary" : "info"}>
          {user.role === "ADMIN" ? "Administrador" : "Usuario"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Registro",
      sortable: true,
      className: "whitespace-nowrap",
      cell: (user) => formatDate(user.createdAt),
    },
    {
      key: "actions",
      header: "Acciones",
      className: "w-24 text-right",
      cell: (user) => (
        <div className="flex justify-end gap-1">
          <EditLink href={`/dashboard/users/${user.id}/edit`} />
          {user.id !== currentUser.id && (
            <DeleteButton
              endpoint={`/api/users/${user.id}`}
              confirmMessage={`¿Eliminar a ${user.email}? Esta acción no se puede deshacer.`}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestiona las cuentas y sus roles."
        actions={
          <Link href="/dashboard/users/new" className={buttonVariants()}>
            <Plus className="size-4" aria-hidden />
            Nuevo usuario
          </Link>
        }
      />
      <DataTable
        basePath="/dashboard/users"
        columns={columns}
        rows={rows}
        total={total}
        state={{ ...state, page }}
        searchPlaceholder="Buscar por nombre o correo…"
        filters={[
          {
            key: "role",
            label: "Rol",
            options: [
              { value: "ADMIN", label: "Administrador" },
              { value: "USER", label: "Usuario" },
            ],
          },
        ]}
        getRowKey={(user) => user.id}
      />
    </>
  );
}
