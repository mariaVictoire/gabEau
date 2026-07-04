"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { HomeLink } from "@/components/ui/HomeLink";
import { Logo } from "@/components/ui/Logo";

const navItems = [
  { href: "/agent/deliveries", label: "Mes livraisons" },
  { href: "/agent/history", label: "Historique" },
];

const barePaths = ["/agent/login", "/agent"];

export function AgentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (barePaths.includes(pathname)) {
    return <>{children}</>;
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/agent/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-water-pattern safe-x">
      <div className="gabon-tricolor sticky top-0 z-20" aria-hidden />
      <header className="sticky top-1 z-10 bg-gabon-hero text-white shadow-lg safe-top">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/agent/deliveries">
            <Logo size="sm" light />
          </Link>
          <div className="flex items-center gap-2">
            <HomeLink light className="px-1" />
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

      <nav className="sticky top-[calc(3.25rem+env(safe-area-inset-top)+4px)] z-10 border-b border-gabon-green/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 py-3.5 text-center text-sm font-semibold transition-colors min-h-[48px] flex items-center justify-center ${
                pathname.startsWith(item.href)
                  ? "text-gabon-green"
                  : "text-slate-400 active:text-slate-600"
              }`}
            >
              {item.label}
              {pathname.startsWith(item.href) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-gabon-green" />
              )}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-lg px-4 py-4 pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  );
}
