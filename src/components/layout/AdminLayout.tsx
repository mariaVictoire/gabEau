"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { HomeLink } from "@/components/ui/HomeLink";
import { Logo } from "@/components/ui/Logo";

const navItems = [
  { href: "/admin/dashboard", label: "Tableau de bord", short: "Accueil", icon: "📊" },
  { href: "/admin/requests", label: "Demandes", short: "Demandes", icon: "📋" },
  { href: "/admin/assignments", label: "Assignations", short: "Assigner", icon: "🚚" },
  { href: "/admin/equipe", label: "Agents", short: "Agents", icon: "👥" },
];

const barePaths = ["/admin/login", "/admin"];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (barePaths.includes(pathname)) {
    return <>{children}</>;
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 safe-x">
      <div className="gabon-tricolor sticky top-0 z-30" aria-hidden />
      <header className="sticky top-1 z-20 border-b border-gabon-blue/20 bg-gabon-hero text-white shadow-lg safe-top">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <Link href="/admin/dashboard">
            <Logo size="sm" light />
          </Link>
          <div className="flex items-center gap-2">
            <HomeLink light className="hidden sm:inline-flex px-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="!text-white hover:!bg-white/15 min-h-[44px]"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-3 sm:px-4 py-4 sm:py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 space-y-1 rounded-2xl border border-gabon-green/10 bg-white p-2 shadow-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-all min-h-[44px] ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-gabon-green to-gabon-blue text-white shadow-md shadow-gabon-green/20"
                    : "text-slate-600 hover:bg-gabon-green-light hover:text-gabon-green-dark"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-gabon-green/10 bg-white/95 backdrop-blur-md md:hidden safe-bottom safe-x">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center py-2 min-h-[56px] text-[10px] font-semibold transition-colors ${
              pathname === item.href ? "text-gabon-green" : "text-slate-400"
            }`}
          >
            <span className="text-xl leading-none mb-0.5">{item.icon}</span>
            {item.short}
          </Link>
        ))}
      </nav>
    </div>
  );
}
