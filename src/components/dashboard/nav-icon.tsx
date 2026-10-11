import { Home, Package, Plus, Settings, Tags, User, Users, type LucideProps } from "lucide-react";
import type { IconName } from "@/config/dashboard";

const icons = {
  home: Home,
  package: Package,
  tags: Tags,
  users: Users,
  user: User,
  settings: Settings,
  plus: Plus,
} satisfies Record<IconName, React.ComponentType<LucideProps>>;

export function NavIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = icons[name];
  return <Icon aria-hidden {...props} />;
}
