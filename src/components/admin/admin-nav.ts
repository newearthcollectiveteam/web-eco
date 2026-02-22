import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Palette,
  Map,
  Wrench,
  DollarSign,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  items?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  href: string;
  badge?: string;
}

export const ADMIN_SIDEBAR_NAV: NavItem[] = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Team",
    href: "/admin/team",
    icon: UserPlus,
  },
  {
    title: "CRM",
    icon: Users,
    items: [
      { title: "Dashboard", href: "/admin/crm" },
      { title: "Contacts", href: "/admin/crm/contacts" },
      { title: "Leads", href: "/admin/crm/leads" },
    ],
  },
  {
    title: "Finance",
    icon: DollarSign,
    items: [
      { title: "Overview", href: "/admin/finance" },
      { title: "Revenue", href: "/admin/finance/revenue" },
      { title: "Expenses", href: "/admin/finance/expenses" },
      { title: "Yearly Review", href: "/admin/finance/yearly" },
      { title: "Tax & Deductions", href: "/admin/finance/tax" },
    ],
  },
  {
    title: "CMS",
    icon: FileText,
    items: [
      { title: "Gallery", href: "/admin/cms/gallery" },
    ],
  },
  {
    title: "Assets",
    icon: Palette,
    items: [
      { title: "Brand", href: "/admin/brand" },
      { title: "Shaders", href: "/admin/shaders" },
      { title: "Playground", href: "/admin/playground" },
    ],
  },
  {
    title: "Ecosystem",
    href: "/admin/ecosystem",
    icon: Map,
  },
  {
    title: "Tooling",
    icon: Wrench,
    items: [
      { title: "Inventory", href: "/admin/tooling" },
      { title: "Database", href: "/admin/tooling/database" },
    ],
  },
];

export const ADMIN_FOOTER_LINKS = [
  {
    label: "joinnewearthcollective.com",
    href: "https://joinnewearthcollective.com",
  },
];
