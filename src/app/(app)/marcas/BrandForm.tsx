"use client";

import { useActionState } from "react";
import { saveBrandAction } from "../actions";
import { REGISTERS, VARIANTS } from "@/lib/engine/options";

type Brand = {
  id?: number; name?: string; kind?: string; description?: string; audience?: string; personality?: string; tone?: string;
  products?: string; services?: string; valueProp?: string; allowedWords?: string[]; bannedWords?: string[]; goals?: string;
  maxRegister?: string; spanishVariant?: string;
};

const FIELDS: [keyof Brand, string, boolean][] = [
  ["description", "Descripción", true], ["audience", "Audiencia", true], ["personality", "Personalidad", true], ["tone", "Tono", true],
  ["products", "Productos", false], ["services", "Servicios", false], ["valueProp", "Propuesta de valor", true], ["goals", "Objetivos comerciales", true],
];

export function BrandForm({ brand }: { brand?: Brand }) {
  const [state, action, pending] = useActionState(saveBrandAction, null);
  return (
    <form action={action} className="card p-6 space-y-4">
      {brand?.id && <input type="hidden" name="id" value={brand.id} />}
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">Nombre</label><input name="name" className="field" defaultValue={brand?.name} required /></div>
        <div>
          <label className="label">Tipo</label>
          <select name="kind" className="field" defaultValue={brand?.kind ?? "otra"}>
            <option value="marca_personal">Marca personal</option><option value="empresa">Empresa</option>
            <option value="qube">QUBE C-Level Advisory</option><option value="serena">Serena</option><option value="otra">Otra marca</option>
          </select>
        </div>
      </div>
      {FIELDS.map(([k, label, long]) => (
        <div key={k}>
          <label className="label">{label}</label>
          {long ? <textarea name={k} className="field min-h-20" defaultValue={brand?.[k] as string} /> : <input name={k} className="field" defaultValue={brand?.[k] as string} />}
        </div>
      ))}
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label">Palabras permitidas (separadas por coma)</label><input name="allowedWords" className="field" defaultValue={brand?.allowedWords?.join(", ")} /></div>
        <div><label className="label">Palabras prohibidas (separadas por coma)</label><input name="bannedWords" className="field" defaultValue={brand?.bannedWords?.join(", ")} /></div>
        <div>
          <label className="label">Techo de coloquialidad</label>
          <select name="maxRegister" className="field" defaultValue={brand?.maxRegister ?? "cafe"}>
            {REGISTERS.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Variante de español</label>
          <select name="spanishVariant" className="field" defaultValue={brand?.spanishVariant ?? "colombiano"}>
            {VARIANTS.map((v) => <option key={v.code} value={v.code}>{v.name}</option>)}
          </select>
        </div>
      </div>
      {state?.error && <p className="text-danger text-sm">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Guardando…" : "Guardar marca"}</button>
    </form>
  );
}
