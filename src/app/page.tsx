import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const features = [
  {
    label: "Sans compte",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3" aria-hidden>
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "2 minutes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Libreville",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
];

const citizenOptions = [
  {
    href: "/commander",
    title: "Commander",
    description: "Demandez une livraison d'eau en quelques clics",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
      </svg>
    ),
    iconBg: "from-gabon-green to-gabon-blue",
    ring: "ring-gabon-green/10 hover:ring-gabon-green/25",
    shadow: "shadow-gabon-green/10 hover:shadow-gabon-green/20",
  },
  {
    href: "/track",
    title: "Suivre ma demande",
    description: "Consultez le statut avec votre numéro de demande",
    detail: "N° de demande + téléphone",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
    iconBg: "from-gabon-blue to-gabon-green",
    ring: "ring-gabon-blue/10 hover:ring-gabon-blue/25",
    shadow: "shadow-gabon-blue/10 hover:shadow-gabon-blue/20",
    detailColor: "text-gabon-blue",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col safe-x bg-gabon-green-light/30">
      <div className="gabon-tricolor" aria-hidden />

      <header className="relative overflow-hidden bg-gabon-hero px-4 pt-10 pb-16 safe-top sm:pt-14 sm:pb-20">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gabon-yellow/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" light />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Eau
            <br />
            <span className="text-gabon-yellow">à Libreville</span>
          </h1>
          <p className="mt-3 text-sm text-white/80 max-w-xs mx-auto">
            Commandez ou suivez votre livraison
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {features.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm ring-1 ring-white/25"
              >
                <span className="opacity-90">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-lg flex-1 px-4 -mt-10 pb-6 safe-bottom">
        <div className="space-y-3 animate-fade-up">
          {citizenOptions.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              className={`group block rounded-2xl bg-white p-5 shadow-xl ring-1 transition-all active:scale-[0.99] card-hover ${opt.ring} ${opt.shadow}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${opt.iconBg} text-white shadow-lg`}
                >
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-lg font-bold text-slate-900">{opt.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{opt.description}</p>
                  {opt.detail && (
                    <p className={`mt-2 text-sm font-semibold ${opt.detailColor}`}>{opt.detail}</p>
                  )}
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-gabon-green group-hover:text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-gabon-green/10 bg-white py-4 text-center safe-bottom">
        <div className="gabon-tricolor mb-3 max-w-[120px] mx-auto rounded-full" aria-hidden />
        <p className="text-xs text-slate-400">Gab&apos;Eau - Livraison d&apos;eau</p>
        <Link
          href="/connexion"
          className="mt-3 inline-block text-[11px] font-medium text-slate-400 hover:text-gabon-green transition-colors"
        >
          Accès personnel →
        </Link>
      </footer>
    </div>
  );
}
