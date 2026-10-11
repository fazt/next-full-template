export type IconName = "home" | "package" | "tags" | "users" | "user" | "settings" | "plus";

export type DashboardLink = {
  title: string;
  href: string;
  icon: IconName;
  adminOnly?: boolean;
};

/** Navegación lateral y de la paleta de comandos. */
export const dashboardNav: DashboardLink[] = [
  { title: "Inicio", href: "/dashboard", icon: "home" },
  { title: "Productos", href: "/dashboard/products", icon: "package" },
  { title: "Categorías", href: "/dashboard/categories", icon: "tags" },
  { title: "Usuarios", href: "/dashboard/users", icon: "users", adminOnly: true },
  { title: "Perfil", href: "/dashboard/profile", icon: "user" },
  { title: "Ajustes", href: "/dashboard/settings", icon: "settings" },
];

/** Acciones rápidas de la paleta de comandos. */
export const dashboardActions: DashboardLink[] = [
  { title: "Nuevo producto", href: "/dashboard/products/new", icon: "plus", adminOnly: true },
  { title: "Nueva categoría", href: "/dashboard/categories/new", icon: "plus", adminOnly: true },
  { title: "Nuevo usuario", href: "/dashboard/users/new", icon: "plus", adminOnly: true },
];

export function linksForRole(links: DashboardLink[], role: "ADMIN" | "USER") {
  return links.filter((link) => !link.adminOnly || role === "ADMIN");
}
