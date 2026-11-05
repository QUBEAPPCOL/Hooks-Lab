import { MECHANISM_NAMES } from "@/data/mechanisms";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="text-[11px] tracking-[0.25em] text-muted font-semibold uppercase">{eyebrow}</p>}
      <h1 className="serif text-3xl sm:text-4xl mt-1">{title}</h1>
      {children && <div className="text-ink-2 mt-2 max-w-3xl">{children}</div>}
    </header>
  );
}

export function MechBadge({ code }: { code: string }) {
  return (
    <span className="inline-block rounded-full bg-olive-soft text-ink text-xs px-2.5 py-0.5 font-medium">
      {MECHANISM_NAMES[code] ?? code}
    </span>
  );
}

export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "rose" | "danger" }) {
  const cls =
    tone === "rose"
      ? "bg-rose-soft text-ink"
      : tone === "danger"
        ? "bg-rose-soft text-danger"
        : "bg-surface-2 text-ink-2";
  return <span className={`inline-block rounded-md text-xs px-2 py-0.5 ${cls}`}>{children}</span>;
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="label">{label}</p>
      <p className="serif text-3xl">{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
      <div className="h-full bg-olive" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card p-8 text-center text-ink-2">{children}</div>;
}
