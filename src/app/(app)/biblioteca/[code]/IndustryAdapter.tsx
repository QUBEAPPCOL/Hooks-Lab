"use client";

import { useActionState, useState } from "react";
import { adaptAction } from "../../actions";
import { VARIANTS } from "@/lib/engine/options";

export function IndustryAdapter({ code, industries }: { code: string; industries: { code: string; name: string }[] }) {
  const [state, action, pending] = useActionState(adaptAction, null);
  const [sel, setSel] = useState<string[]>(["rrhh", "marketing", "psicologia", "ventas"]);
  return (
    <form action={action} className="card p-5 sm:p-6">
      <h2 className="serif text-xl">Adaptar a industrias</h2>
      <p className="text-sm text-ink-2 mt-1 mb-4">El motor usa el léxico y las tensiones reales de cada industria.</p>
      <input type="hidden" name="structureCode" value={code} />
      <div className="flex flex-wrap gap-2">
        {industries.map((i) => (
          <label key={i.code} className="chip relative">
            <input
              type="checkbox"
              name="industries"
              value={i.code}
              checked={sel.includes(i.code)}
              onChange={(e) => setSel(e.target.checked ? [...sel, i.code] : sel.filter((x) => x !== i.code))}
            />
            {i.name}
          </label>
        ))}
      </div>
      <div className="flex gap-3 mt-4 items-center">
        <select name="variant" className="field w-auto" defaultValue="colombiano">
          {VARIANTS.map((v) => <option key={v.code} value={v.code}>{v.name}</option>)}
        </select>
        <button className="btn btn-primary" disabled={pending || sel.length === 0}>{pending ? "Adaptando…" : "Adaptar"}</button>
      </div>
      {state?.error && <p className="text-danger text-sm mt-3">{state.error}</p>}
      {state?.items && (
        <ul className="mt-5 space-y-3">
          {state.items.map((it) => (
            <li key={it.industry} className="rounded-xl bg-surface-2 p-4">
              <p className="label mb-1">{it.industryName}</p>
              <p>{it.hook}</p>
              <p className="text-xs text-muted mt-1">Tensión: {it.tension}</p>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
