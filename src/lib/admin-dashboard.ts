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
      { href: "/admin/jobs", label: "Opportunities" },
      { href: "/admin/operations", label: "Operations Board" },
      { href: "/admin/interviews", label: "Participant Reviews" },
      { href: "/admin/settings", label: "Settings" },
    ];
  }

  return [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/leads", label: "My Inquiries" },
    { href: "/admin/jobs", label: "My Opportunities" },
    { href: "/admin/operations", label: "Operations Board" },
    { href: "/admin/interviews", label: "My Reviews" },
  ];
}
