import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { dashboardActions, dashboardNav, linksForRole } from "@/config/dashboard";
import { requireUser } from "@/libs/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <DashboardShell
      user={{ name: user.name, email: user.email, image: user.image, role: user.role }}
      nav={linksForRole(dashboardNav, user.role)}
      actions={linksForRole(dashboardActions, user.role)}
    >
      {children}
    </DashboardShell>
  );
}
