import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { HomeLink } from "@/components/ui/HomeLink";

const staffOptions = [
  {
    href: "/agent",
    title: "Agent livraison",
    description: "Mes livraisons du jour, confirmation et historique",
    iconBg: "bg-gabon-yellow-light text-gabon-yellow-dark group-hover:bg-gabon-yellow group-hover:text-gabon-green-dark",
    border: "hover:border-gabon-yellow hover:bg-gabon-yellow-light/30",
  },
  {
    href: "/admin",
    title: "Administration",
    description: "Demandes, assignations et gestion des agents",
    iconBg: "bg-gabon-blue-light text-gabon-blue group-hover:bg-gabon-blue group-hover:text-white",
    border: "hover:border-gabon-blue hover:bg-gabon-blue-light/30",
  },
];

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex flex-col safe-x bg-slate-50">
      <div className="gabon-tricolor" aria-hidden />

      <header className="bg-gradient-to-br from-slate-700 via-slate-800 to-gabon-green-dark px-4 pt-10 pb-12 safe-top text-center">
        <Link href="/" className="inline-flex justify-center mb-5">
          <Logo size="lg" light />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Accès personnel</h1>
        <p className="text-sm text-white/75 mt-2 max-w-xs mx-auto">
          Réservé aux agents livreurs et à l&apos;équipe Gab&apos;Eau
        </p>
      </header>

      <main className="relative mx-auto w-full max-w-lg flex-1 px-4 -mt-6 pb-8 safe-bottom">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {staffOptions.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98] min-h-[160px] ${opt.border}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${opt.iconBg}`}
              >
                {opt.href === "/agent" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                    <path d="M1 3h15v13H1zM16 8h4l3 5v3h-7V8z" strokeLinejoin="round" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                )}
              </div>
              <p className="mt-4 font-bold text-slate-900">{opt.title}</p>
              <p className="mt-1 text-xs text-slate-500 flex-1">{opt.description}</p>
              <p className="mt-3 text-xs font-semibold text-gabon-green group-hover:underline">
                Se connecter →
              </p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center">
          <HomeLink className="justify-center" />
        </p>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center safe-bottom">
        <p className="text-xs text-slate-400">Gab&apos;Eau — Espace personnel</p>
      </footer>
    </div>
  );
}
