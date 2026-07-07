import Link from "next/link";

export function HomeLink({
  className = "",
  light = false,
  iconOnly = false,
}: {
  className?: string;
  light?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={iconOnly ? "Accueil" : undefined}
      title={iconOnly ? "Accueil" : undefined}
      className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
        iconOnly
          ? `h-11 w-11 justify-center rounded-xl ${
              light
                ? "text-white/90 hover:bg-white/15 hover:text-white"
                : "text-gabon-green-dark hover:bg-gabon-green-light/60 hover:text-gabon-green"
            }`
          : `text-sm min-h-[44px] ${
              light
                ? "text-white/90 hover:text-white"
                : "text-gabon-green-dark hover:text-gabon-green"
            }`
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={iconOnly ? "h-5 w-5" : "h-4 w-4"}
        aria-hidden
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" strokeLinejoin="round" />
      </svg>
      {!iconOnly && "Accueil"}
    </Link>
  );
}
