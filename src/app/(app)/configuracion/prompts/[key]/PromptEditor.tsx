"use client";

import { useActionState } from "react";
import { savePromptVersionAction } from "../../../actions";

export function PromptEditor({ p }: { p: { key: string; system: string; template: string; effort: string; version: number } }) {
  const [state, action, pending] = useActionState(savePromptVersionAction, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="key" value={p.key} />
      <div><label className="label">System</label><textarea name="system" defaultValue={p.system} className="field font-mono text-xs min-h-72" /></div>
      <div><label className="label">Plantilla (variables entre llaves dobles)</label><textarea name="template" defaultValue={p.template} className="field font-mono text-xs min-h-72" /></div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Esfuerzo del modelo</label>
          <select name="effort" defaultValue={p.effort} className="field">
            {["low", "medium", "high", "xhigh", "max"].map((e) => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div><label className="label">Nota de la versión</label><input name="notes" className="field" placeholder="Qué cambiaste y por qué" /></div>
      </div>
      {state?.error && <p className="text-danger text-sm">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Guardando…" : `Guardar como v${p.version + 1} y activar`}</button>
    </form>
  );
}
