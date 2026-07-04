import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-gabon-green to-gabon-blue text-white shadow-md shadow-gabon-green/25 hover:from-gabon-green-dark hover:to-gabon-blue-dark focus:ring-gabon-green",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400",
  danger:
    "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md shadow-red-500/20 hover:from-red-700 hover:to-rose-600 focus:ring-red-500",
  success:
    "bg-gradient-to-r from-gabon-green to-emerald-600 text-white shadow-md shadow-gabon-green/20 hover:from-gabon-green-dark hover:to-emerald-700 focus:ring-gabon-green",
  outline:
    "border-2 border-gabon-green/30 text-gabon-green-dark bg-white hover:bg-gabon-green-light hover:border-gabon-green focus:ring-gabon-green",
  ghost:
    "text-slate-600 hover:bg-slate-100 focus:ring-slate-400",
};

const sizes = {
  sm: "px-3 py-2 text-sm rounded-lg min-h-[40px]",
  md: "px-4 py-3 text-base rounded-xl min-h-[48px]",
  lg: "px-6 py-4 text-base font-semibold rounded-xl min-h-[52px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Chargement...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
