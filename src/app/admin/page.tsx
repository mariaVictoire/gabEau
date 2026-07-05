import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { HomeLink } from "@/components/ui/HomeLink";
import { Button } from "@/components/ui/Button";

const features = [
  {
    title: "Appel 18",
    description: "Enregistrer une commande téléphonique",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Tableau de bord",
    description: "Statistiques et demandes par quartier",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    title: "Demandes",
    description: "Rechercher, consulter et exporter",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Assignations",
    description: "Affecter les livraisons aux agents",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M1 3h15v13H1zM16 8h4l3 5v3h-7V8z" strokeLinejoin="round" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Agents",
    description: "Créer des agents livreurs (code + PIN)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen flex flex-col safe-x bg-gabon-blue-light/30">
      <div className="gabon-tricolor" aria-hidden />

      <header className="relative overflow-hidden bg-gradient-to-br from-gabon-blue via-gabon-blue-dark to-gabon-green px-4 pt-10 pb-14 safe-top">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gabon-yellow/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-lg text-center">
          <Link href="/" className="inline-flex justify-center mb-6">
            <Logo size="lg" light />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administration
          </h1>
          <p className="mt-2 text-sm text-white/80 max-w-xs mx-auto">
            Opérateurs et coordinateurs — gestion des demandes
          </p>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-lg flex-1 px-4 -mt-8 pb-8 safe-bottom">
        <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-gabon-blue/10 space-y-3">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-xl bg-gabon-blue-light/40 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gabon-blue text-white">
                {f.icon}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{f.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/admin/login" className="mt-4 block">
          <Button size="lg" className="w-full">
            Se connecter
          </Button>
        </Link>

        <p className="mt-6 text-center flex flex-col items-center gap-2 text-sm">
          <Link href="/connexion" className="font-semibold text-gabon-blue hover:underline">
            ← Accès personnel
          </Link>
          <HomeLink className="justify-center" />
        </p>
      </main>

      <footer className="border-t border-gabon-blue/10 bg-white py-4 text-center safe-bottom">
        <p className="text-xs text-slate-400">Gab&apos;Eau — Espace administration</p>
      </footer>
    </div>
  );
}
