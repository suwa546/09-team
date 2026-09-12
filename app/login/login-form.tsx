"use client";

import { useActionState } from "react";
import { authenticate } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(authenticate, undefined);
  return (
    <form action={action} className="space-y-5">
      <label className="field-label">メールアドレス<input className="input" name="email" type="email" autoComplete="email" required defaultValue="staff@example.com" /></label>
      <label className="field-label">パスワード<input className="input" name="password" type="password" autoComplete="current-password" required defaultValue="staff1234" /></label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="button-primary w-full" disabled={pending}>{pending ? "ログイン中…" : "ログイン"}</button>
    </form>
  );
}
