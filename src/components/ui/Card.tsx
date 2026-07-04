import { type ReactNode } from "react";

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>
  );
}
