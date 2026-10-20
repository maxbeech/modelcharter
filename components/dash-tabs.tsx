"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/tools", label: "Tool register" },
  { href: "/dashboard/policy", label: "Policy" },
  { href: "/dashboard/attestations", label: "Staff sign-off" },
  { href: "/dashboard/evidence", label: "Evidence pack" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function DashTabs() {
  const path = usePathname();
  return (
    <nav className="mt-6 flex flex-wrap gap-1 border-b border-line">
      {TABS.map((t) => {
        const active = t.href === "/dashboard" ? path === t.href : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${active ? "border-brand-600 text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
