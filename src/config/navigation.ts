import {
  LayoutDashboard,
  Users,
  Building2,
  Trash2,
  Container,
  Gift,
  FileText,
  BarChart3,
  HeadphonesIcon,
  Bell,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  shortcut?: string;
  badge?: number;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: "LayoutDashboard",
        shortcut: "⌘D",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Users", href: "/users", icon: "Users", shortcut: "⌘U" },
      {
        title: "Businesses",
        href: "/businesses",
        icon: "Building2",
        shortcut: "⌘B",
      },
      {
        title: "Waste Submissions",
        href: "/waste-submissions",
        icon: "Trash2",
      },
      { title: "Bin Management", href: "/bins", icon: "Container" },
      { title: "Rewards", href: "/rewards", icon: "Gift" },
      { title: "Reports", href: "/reports", icon: "FileText" },
      {
        title: "Analytics",
        href: "/analytics",
        icon: "BarChart3",
        shortcut: "⌘A",
      },
    ],
  },
  {
    label: "Customer",
    items: [
      { title: "Support", href: "/support", icon: "HeadphonesIcon" },
      { title: "Notifications", href: "/notifications", icon: "Bell" },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: "Settings",
        shortcut: "⌘,",
      },
    ],
  },
];

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Building2,
  Trash2,
  Container,
  Gift,
  FileText,
  BarChart3,
  HeadphonesIcon,
  Bell,
  Settings,
};
