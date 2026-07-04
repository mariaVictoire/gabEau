import { type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={3}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base text-slate-900 placeholder-slate-400 transition-colors focus:border-gabon-green focus:bg-white focus:outline-none focus:ring-2 focus:ring-gabon-green/20 resize-none ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
