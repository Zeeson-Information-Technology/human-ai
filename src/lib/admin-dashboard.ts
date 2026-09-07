export type AdminNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export function getAdminNav(role?: string): AdminNavItem[] {
  const isAdmin = role === "admin";

  if (isAdmin) {
    return [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/leads", label: "Inquiries" },
      { href: "/admin/clients", label: "Clients" },
      { href: "/admin/opportunities", label: "Opportunities" },
      { href: "/admin/sourcing", label: "Opportunity Sourcing" },
      { href: "/admin/operations", label: "Operations Board" },
      { href: "/admin/interviews", label: "Participant Reviews" },
      { href: "/admin/settings", label: "Settings" },
    ];
  }

  return [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/leads", label: "My Inquiries" },
    { href: "/admin/clients", label: "Clients" },
    { href: "/admin/opportunities", label: "My Opportunities" },
    { href: "/admin/sourcing", label: "Opportunity Sourcing" },
    { href: "/admin/operations", label: "Operations Board" },
    { href: "/admin/interviews", label: "My Reviews" },
  ];
}
