import Link from "next/link";

export function HomeLink({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors min-h-[44px] ${
        light
          ? "text-white/90 hover:text-white"
          : "text-gabon-green-dark hover:text-gabon-green"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" strokeLinejoin="round" />
      </svg>
      Accueil
    </Link>
  );
}
