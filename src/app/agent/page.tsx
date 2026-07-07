import Link from "next/link";
import { LandingTopBar } from "@/components/layout/LandingTopBar";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const features = [
  {
    title: "Livraisons du jour",
    description: "Consultez vos missions assignées",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M1 3h15v13H1zM16 8h4l3 5v3h-7V8z" strokeLinejoin="round" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Confirmation livraison",
    description: "Signature du bénéficiaire",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    title: "Historique",
    description: "Retrouvez vos livraisons passées",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AgentLandingPage() {
  return (
    <div className="min-h-screen flex flex-col safe-x bg-gabon-yellow-light/40">
      <LandingTopBar backHref="/connexion" backLabel="Accès personnel" />

      <header className="relative overflow-hidden bg-gradient-to-br from-gabon-green via-gabon-green-dark to-gabon-yellow px-4 pt-6 pb-14">
        <div className="pointer-events-none absolute -left-12 top-8 h-40 w-40 rounded-full bg-white/15 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-lg text-center">
          <Link href="/" className="inline-flex justify-center mb-6">
            <Logo size="lg" light />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Agent livraison
          </h1>
          <p className="mt-2 text-sm text-white/85 max-w-xs mx-auto">
            Livrez l&apos;eau et confirmez chaque mission sur le terrain
          </p>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-lg flex-1 px-4 -mt-8 pb-8 safe-bottom">
        <div className="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-gabon-green/10 space-y-3">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3 rounded-xl bg-gabon-green-light/50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gabon-green text-white">
                {f.icon}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{f.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Link href="/agent/login" className="mt-4 block">
          <Button size="lg" className="w-full">
            Se connecter
          </Button>
        </Link>
      </main>

      <footer className="border-t border-gabon-green/10 bg-white py-4 text-center safe-bottom">
        <p className="text-xs text-slate-400">Gab&apos;Eau - Espace agent</p>
      </footer>
    </div>
  );
}
