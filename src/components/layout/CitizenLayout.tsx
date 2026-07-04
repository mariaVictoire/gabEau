import Link from "next/link";
import { type ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { HomeLink } from "@/components/ui/HomeLink";

export function CitizenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-water-pattern flex flex-col safe-x">
      <header className="sticky top-0 z-10 border-b border-gabon-green/10 bg-white/90 backdrop-blur-md safe-top">
        <div className="gabon-tricolor" aria-hidden />
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="shrink-0">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-1">
            <HomeLink />
            <Link
              href="/track"
              className="rounded-xl bg-gabon-green-light px-3 py-2.5 text-sm font-semibold text-gabon-green-dark transition-colors active:bg-gabon-green/10 min-h-[44px] flex items-center"
            >
            <span className="sm:hidden">Suivre</span>
            <span className="hidden sm:inline">Suivre ma demande</span>
          </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 sm:py-6">
        {children}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 py-4 text-center safe-bottom">
        <p className="text-xs text-slate-400">
          Gab&apos;Eau — Livraison d&apos;eau
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Libreville, Gabon</p>
      </footer>
    </div>
  );
}
