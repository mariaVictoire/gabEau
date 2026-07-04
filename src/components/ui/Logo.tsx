export function Logo({
  size = "md",
  light = false,
}: {
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center rounded-xl shadow-md ${
          light
            ? "bg-white/20 shadow-black/10 backdrop-blur-sm ring-1 ring-white/30"
            : "bg-gradient-to-br from-gabon-green to-gabon-blue shadow-gabon-green/25"
        }`}
        style={{ width: s.icon, height: s.icon }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="white"
          className="w-[55%] h-[55%]"
          aria-hidden
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
        </svg>
      </div>
      <span
        className={`font-bold tracking-tight ${s.text} ${light ? "text-white" : "text-slate-900"}`}
      >
        Gab
        <span className={light ? "text-gabon-yellow" : "text-gabon-green"}>&apos;</span>
        Eau
      </span>
    </div>
  );
}
