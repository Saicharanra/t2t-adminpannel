import {
  SquaresFour,
  Users,
  Buildings,
  Trash,
  Archive,
  Gift,
  FileText,
  ChartBar,
  Headset,
  Bell,
  Gear,
} from "@phosphor-icons/react";

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
      {
        title: "Carbon Impact",
        href: "/carbon-impact",
        icon: "Leaf",
        shortcut: "⌘C",
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
        title: "Audit Logs",
        href: "/audit-logs",
        icon: "ScrollText",
        shortcut: "⌘L",
      },
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
  LayoutDashboard: SquaresFour,
  Users: Users,
  Building2: Buildings,
  Trash2: Trash,
  Container: Archive,
  Gift: Gift,
  FileText: FileText,
  BarChart3: ChartBar,
  Leaf: ChartBar,
  HeadphonesIcon: Headset,
  Bell: Bell,
  ScrollText: FileText,
  Settings: Gear,
};
