import { Landmark } from "lucide-react";
import Link from "next/link";

type BrandProps = {
  href?: string;
  compact?: boolean;
  inverse?: boolean;
};

export function Brand({
  href = "/",
  compact = false,
  inverse = false,
}: BrandProps) {
  return (
    <Link
      aria-label="Plataforma Financeira"
      className={`group inline-flex min-w-0 items-center gap-3 ${inverse ? "text-white" : "text-neutral-950"}`}
      href={href}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-800 text-white shadow-sm transition group-hover:bg-emerald-900">
        <Landmark aria-hidden="true" size={19} strokeWidth={2.2} />
      </span>
      <span className={`min-w-0 ${compact ? "hidden min-[480px]:block" : "block"}`}>
        <span className="block truncate text-sm font-extrabold leading-5">
          Plataforma Financeira
        </span>
        {!compact && (
          <span className={`block truncate text-xs ${inverse ? "text-emerald-100/70" : "text-neutral-500"}`}>
            Educação financeira acessível
          </span>
        )}
      </span>
    </Link>
  );
}
