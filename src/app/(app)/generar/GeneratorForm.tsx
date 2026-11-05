"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { createGenerationAction } from "../actions";
import { MECHANISM_NAMES } from "@/data/mechanisms";
import {
  AUDIENCES, COUNTS, FORMATS, OBJECTIVES, PLATFORMS, REGISTERS, REGISTER_ORDER, SELECTABLE_MECHANISMS, TONES, TONE_NAMES, VARIANTS,
} from "@/lib/engine/options";

type Brand = { id: number; name: string; maxRegister: string; spanishVariant: string };
type Creator = { slug: string; name: string; showName: boolean };
type Industry = { code: string; name: string };

export type Preset = Partial<{
  brandId: number; platform: string; topic: string; segments: string[]; objective: string; mechanisms: string[];
  tones: string[]; format: string; count: number;
}>;

function Chips<T extends string | number>({
  options, value, onChange, multi = false, label,
}: {
  options: { value: T; label: string }[]; value: T[]; onChange: (v: T[]) => void; multi?: boolean; label?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            type="button"
            key={String(o.value)}
            className="chip"
            data-on={on}
            aria-pressed={on}
            onClick={() => onChange(multi ? (on ? value.filter((v) => v !== o.value) : [...value, o.value]) : [o.value])}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Section({ letter, title, hint, children }: { letter: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="serif text-olive text-lg">{letter}</span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function GeneratorForm({ brands, creators, industries, preset }: { brands: Brand[]; creators: Creator[]; industries: Industry[]; preset?: Preset }) {
  const [state, action, pending] = useActionState(createGenerationAction, null);
  const [brandId, setBrandId] = useState<number>(preset?.brandId ?? brands[0]?.id ?? 0);
  const brand = brands.find((b) => b.id === brandId);
  const [platform, setPlatform] = useState<string[]>([preset?.platform ?? "linkedin"]);
  const [topic, setTopic] = useState(preset?.topic ?? "");
  const [segments, setSegments] = useState<string[]>(preset?.segments ?? []);
  const [customAudience, setCustomAudience] = useState("");
  const [details, setDetails] = useState({ age: "", interests: "", problems: "", aspirations: "", knowledge: "" });
  const [objective, setObjective] = useState<string[]>([preset?.objective ?? "alcance"]);
  const [mechanisms, setMechanisms] = useState<string[]>(preset?.mechanisms ?? []);
  const [tones, setTones] = useState<string[]>(preset?.tones ?? []);
  const [format, setFormat] = useState<string[]>([preset?.format ?? "solo_hooks"]);
  const [count, setCount] = useState<number[]>([preset?.count ?? 10]);
  const [register, setRegister] = useState<string>("");
  const [variant, setVariant] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [references, setReferences] = useState<string[]>([]);
  const [extraContext, setExtraContext] = useState("");

  const allowedRegisters = useMemo(() => {
    const max = REGISTER_ORDER.indexOf(brand?.maxRegister ?? "cafe");
    return REGISTERS.filter((r) => REGISTER_ORDER.indexOf(r.code) <= max);
  }, [brand]);

  const payload = JSON.stringify({
    brandId,
    platform: platform[0],
    topic,
    audience: { segments, custom: customAudience, ...details },
    objective: objective[0],
    mechanisms,
    tones,
    format: format[0],
    count: count[0],
    register: register || undefined,
    variant: variant || undefined,
    industry: industry || null,
    references,
    extraContext,
  });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="payload" value={payload} />

      <Section letter="A" title="Marca" hint="La voz, las palabras prohibidas y el techo de coloquialidad salen de aquí.">
        <div className="flex flex-wrap gap-3 items-center">
          <select className="field max-w-xs" value={brandId} onChange={(e) => setBrandId(Number(e.target.value))}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <Link href="/marcas/nueva" className="text-sm text-olive underline underline-offset-4">+ Crear marca</Link>
        </div>
      </Section>

      <Section letter="B" title="Red social">
        <Chips options={PLATFORMS.map((p) => ({ value: p.code, label: p.name }))} value={platform} onChange={setPlatform} label="Red social" />
      </Section>

      <Section letter="C" title="Tema" hint="Pega una opinión, una noticia, una experiencia, una historia o el texto de una publicación. Si hay cifras, pon la fuente: el motor no inventa datos.">
        <textarea className="field min-h-32" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ej.: LinkedIn se está convirtiendo en Instagram, pero algunas personas siguen consiguiendo clientes ahí…" required />
      </Section>

      <Section letter="D" title="Audiencia">
        <Chips options={AUDIENCES.map((a) => ({ value: a, label: a }))} value={segments} onChange={setSegments} multi label="Audiencia" />
        <input className="field mt-3" placeholder="Otra audiencia (escríbela)" value={customAudience} onChange={(e) => setCustomAudience(e.target.value)} />
        <details className="mt-3">
          <summary className="text-sm text-olive cursor-pointer">Afinar audiencia (edad, intereses, problemas, aspiraciones, conocimiento)</summary>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {(["age", "interests", "problems", "aspirations", "knowledge"] as const).map((k) => (
              <input
                key={k}
                className="field"
                placeholder={{ age: "Edad", interests: "Intereses", problems: "Problemas", aspirations: "Aspiraciones", knowledge: "Nivel de conocimiento del tema" }[k]}
                value={details[k]}
                onChange={(e) => setDetails({ ...details, [k]: e.target.value })}
              />
            ))}
          </div>
        </details>
      </Section>

      <Section letter="E" title="Objetivo" hint="Cambia los pesos del evaluador: un hook para leads no se califica igual que uno para alcance.">
        <Chips options={OBJECTIVES.map((o) => ({ value: o.code, label: o.name }))} value={objective} onChange={setObjective} label="Objetivo" />
      </Section>

      <Section letter="F" title="Mecanismo psicológico" hint="Elige uno o varios para combinarlos. Si no eliges ninguno, el motor selecciona y combina los más adecuados.">
        <div className="mb-3">
          <button type="button" className="chip" data-on={mechanisms.length === 0} onClick={() => setMechanisms([])}>
            ✦ Sorpréndeme
          </button>
        </div>
        <Chips options={SELECTABLE_MECHANISMS.map((m) => ({ value: m, label: MECHANISM_NAMES[m] ?? m }))} value={mechanisms} onChange={setMechanisms} multi label="Mecanismos" />
      </Section>

      <Section letter="G" title="Tono y registro">
        <Chips options={TONES.map((t) => ({ value: t, label: TONE_NAMES[t] }))} value={tones} onChange={setTones} multi label="Tono" />
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="label">Registro (techo de la marca: {REGISTERS.find((r) => r.code === brand?.maxRegister)?.name})</label>
            <select className="field" value={register} onChange={(e) => setRegister(e.target.value)}>
              <option value="">El de la marca</option>
              {allowedRegisters.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Variante de español</label>
            <select className="field" value={variant} onChange={(e) => setVariant(e.target.value)}>
              <option value="">La de la marca ({brand?.spanishVariant})</option>
              {VARIANTS.map((v) => (
                <option key={v.code} value={v.code}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section letter="H" title="Formato">
        <Chips options={FORMATS.map((f) => ({ value: f.code, label: f.name }))} value={format} onChange={setFormat} label="Formato" />
      </Section>

      <Section letter="I" title="Cantidad">
        <Chips options={COUNTS.map((c) => ({ value: c, label: String(c) }))} value={count} onChange={setCount} label="Cantidad" />
      </Section>

      <Section letter="J" title="Referencia creativa" hint="Sirve para tomar mecanismos, ritmos y estructuras. Nunca para copiar frases ni imitar identidades.">
        <div className="mb-3">
          <button type="button" className="chip" data-on={references.length === 0} onClick={() => setReferences([])}>
            Creatividad original sin referencias
          </button>
        </div>
        <Chips
          options={creators.map((c) => ({ value: c.slug, label: c.showName ? c.name : `${c.name} (solo mecanismos)` }))}
          value={references}
          onChange={setReferences}
          multi
          label="Creadores"
        />
      </Section>

      <Section letter="K" title="Contexto adicional e industria">
        <select className="field max-w-xs mb-3" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">Industria: cualquiera</option>
          {industries.map((i) => (
            <option key={i.code} value={i.code}>{i.name}</option>
          ))}
        </select>
        <textarea className="field min-h-24" value={extraContext} onChange={(e) => setExtraContext(e.target.value)} placeholder="Datos reales con fuente, anécdotas, la oferta que quieres conectar, lo que NO quieres decir…" />
      </Section>

      <div className="sticky bottom-0 py-4 bg-gradient-to-t from-bg via-bg to-transparent">
        {state?.error && <p className="text-danger text-sm mb-3">{state.error}</p>}
        <button className="btn btn-primary w-full sm:w-auto px-8 py-3 text-base" disabled={pending || topic.trim().length < 10}>
          {pending ? "Planificando ángulos, escribiendo y evaluando… (puede tardar 1–2 min)" : "GENERAR HOOKS"}
        </button>
      </div>
    </form>
  );
}
