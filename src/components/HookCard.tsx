"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import { developAction, toggleFavoriteAction } from "@/app/(app)/actions";
import { MECHANISM_NAMES } from "@/data/mechanisms";
import { CRITERIA } from "@/lib/engine/weights";

const FORMATS = [
  { code: "post_linkedin", name: "Post de LinkedIn" },
  { code: "carrusel", name: "Carrusel" },
  { code: "infografia", name: "Infografía" },
  { code: "reel", name: "Guion de Reel" },
  { code: "tiktok", name: "Guion de TikTok" },
  { code: "articulo", name: "Artículo" },
  { code: "newsletter", name: "Newsletter" },
];

export type HookView = {
  id: number;
  idx: number;
  text: string;
  onScreenText: string | null;
  visualAction: string | null;
  structureCode: string | null;
  structureName: string;
  mechanisms: string[];
  tone: string;
  why: string;
  audience: string;
  weakness: string;
  platformAdaptation: string;
  scores: Record<string, number> | null;
  totals: Record<string, number> | null;
  total: number | null;
  flags: string[];
  judgeNote: string;
  favorite: boolean;
};

export function HookCard({ hook, badge }: { hook: HookView; badge?: string }) {
  const [fav, setFav] = useOptimistic(hook.favorite);
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [state, develop, developing] = useActionState(developAction, null);
  const [copied, setCopied] = useState(false);

  return (
    <article className="card p-5 sm:p-6 transition-shadow hover:shadow-[0_2px_24px_-12px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-mono">#{hook.idx}</span>
          {badge && <span className="text-xs rounded-full bg-rose-soft border border-rose px-2 py-0.5">{badge}</span>}
          <span className="text-xs text-ink-2">{hook.structureCode} · {hook.structureName}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {hook.total != null && (
            <span className="text-xs text-muted" title="Evaluación heurística sobre 100 (no es una probabilidad de éxito)">
              <span className="serif text-xl text-ink">{Math.round(hook.total)}</span>/100
            </span>
          )}
          <button
            aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
            className={`text-xl leading-none transition-transform active:scale-90 ${fav ? "text-rose" : "text-muted hover:text-rose"}`}
            onClick={() =>
              startTransition(async () => {
                setFav(!fav);
                await toggleFavoriteAction(hook.id);
              })
            }
          >
            {fav ? "♥" : "♡"}
          </button>
        </div>
      </div>

      <p className="mt-3 text-lg leading-relaxed whitespace-pre-line">{hook.text}</p>
      {(hook.onScreenText || hook.visualAction) && (
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
          {hook.onScreenText && (
            <div className="rounded-lg bg-surface-2 px-3 py-2"><span className="label mb-0.5">Texto en pantalla</span>{hook.onScreenText}</div>
          )}
          {hook.visualAction && (
            <div className="rounded-lg bg-surface-2 px-3 py-2"><span className="label mb-0.5">Primer segundo</span>{hook.visualAction}</div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {hook.mechanisms.map((m) => (
          <span key={m} className="rounded-full bg-olive-soft text-xs px-2.5 py-0.5">{MECHANISM_NAMES[m] ?? m}</span>
        ))}
        {hook.tone && <span className="rounded-full bg-surface-2 text-xs px-2.5 py-0.5 text-ink-2">{hook.tone}</span>}
      </div>

      {hook.flags.length > 0 && (
        <ul className="mt-3 space-y-1">
          {hook.flags.map((f, i) => (
            <li key={i} className="text-xs text-danger">⚠ {f}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <button className="btn btn-ghost py-1.5 text-sm" onClick={() => setOpen(!open)}>{open ? "Ocultar análisis" : "Ver análisis"}</button>
        <button
          className="btn btn-ghost py-1.5 text-sm"
          onClick={async () => {
            await navigator.clipboard.writeText(hook.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
        <form action={develop} className="flex flex-wrap gap-2 items-center">
          <input type="hidden" name="hookId" value={hook.id} />
          <select name="format" className="field py-1.5 w-auto text-sm" defaultValue="post_linkedin">
            {FORMATS.map((f) => (
              <option key={f.code} value={f.code}>{f.name}</option>
            ))}
          </select>
          <button className="btn btn-primary py-1.5 text-sm" disabled={developing}>
            {developing ? "Desarrollando…" : "DESARROLLAR CONTENIDO"}
          </button>
        </form>
      </div>
      {state?.error && <p className="text-danger text-sm mt-2">{state.error}</p>}

      {open && (
        <div className="mt-5 grid md:grid-cols-2 gap-5 border-t border-line pt-5 text-sm">
          <dl className="space-y-3">
            <div><dt className="label">Por qué puede funcionar</dt><dd>{hook.why}</dd></div>
            <div><dt className="label">A quién atrae</dt><dd>{hook.audience}</dd></div>
            <div><dt className="label">Posible debilidad</dt><dd>{hook.weakness}</dd></div>
            <div><dt className="label">Adaptación a la plataforma</dt><dd>{hook.platformAdaptation}</dd></div>
            {hook.judgeNote && <div><dt className="label">Nota del editor</dt><dd className="italic">{hook.judgeNote}</dd></div>}
          </dl>
          <div>
            <p className="label">Evaluación heurística por criterio (0–10)</p>
            {hook.scores ? (
              <ul className="space-y-1.5">
                {CRITERIA.map((c) => (
                  <li key={c.code} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 text-ink-2">{c.name}</span>
                    <span className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                      <span className="block h-full bg-olive" style={{ width: `${(hook.scores![c.code] ?? 0) * 10}%` }} />
                    </span>
                    <span className="w-6 text-right font-mono text-xs">{hook.scores![c.code] ?? "–"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Sin evaluación.</p>
            )}
            {hook.totals && (
              <p className="text-xs text-muted mt-3">
                Lente alcance {hook.totals.alcance} · interacción {hook.totals.interaccion} · conversión {hook.totals.conversion}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
