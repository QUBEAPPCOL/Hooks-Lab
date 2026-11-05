"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form action={action} className="card w-full max-w-sm p-8 space-y-6">
        <div>
          <p className="text-xs tracking-[0.3em] text-muted font-semibold">LABORATORIO</p>
          <h1 className="serif text-4xl mt-1">HOOKS LAB</h1>
          <p className="text-ink-2 text-sm mt-2">Entender, diseñar y medir la atención.</p>
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required className="field" autoFocus />
        </div>
        {state?.error && <p className="text-danger text-sm">{state.error}</p>}
        <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}
