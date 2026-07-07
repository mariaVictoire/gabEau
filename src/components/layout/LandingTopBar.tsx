import Link from "next/link";
import { HomeLink } from "@/components/ui/HomeLink";

export function LandingTopBar({
  backHref,
  backLabel = "Retour",
}: {
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <>
      <div className="gabon-tricolor sticky top-0 z-20" aria-hidden />
      <div className="sticky top-1 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md safe-top">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2">
          {backHref ? (
            <Link
              href={backHref}
              aria-label={backLabel}
              title={backLabel}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-gabon-green-dark hover:bg-gabon-green-light/60 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : (
            <span className="h-11 w-11" aria-hidden />
          )}
          <HomeLink iconOnly />
        </div>
      </div>
    </>
  );
}
