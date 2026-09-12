"use client";

import type { Status } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function InspectionActions({ id, status, notes, hasImages }: { id: string; status: Status; notes: string; hasImages: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [noteValue, setNoteValue] = useState(notes);

  async function call(path: string, options?: RequestInit, label = "処理") {
    setBusy(label); setMessage("");
    try {
      const response = await fetch(path, options);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? `${label}に失敗しました`);
      setMessage(`${label}が完了しました。`); router.refresh(); return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : `${label}に失敗しました`); return false; }
    finally { setBusy(""); }
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget; const data = new FormData(form);
    if (await call(`/api/inspections/${id}/images`, { method: "POST", body: data }, "画像アップロード")) form.reset();
  }

  return (
    <div className="space-y-5">
      <section className="card">
        <h2 className="text-lg font-bold">検査アクション</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button className="button-secondary" disabled={Boolean(busy)} onClick={() => call(`/api/inspections/${id}/imei-check`, undefined, "IMEI・通信制限照会")}>IMEI・通信制限を照会</button>
          <button className="button-primary" disabled={Boolean(busy) || !hasImages} onClick={() => call(`/api/inspections/${id}/analyze`, { method: "POST" }, "画像解析")}>画像を解析・グレード判定</button>
        </div>
        {!hasImages && <p className="mt-3 text-xs text-amber-700">画像解析には1枚以上の画像が必要です。</p>}
      </section>
      <section className="card">
        <h2 className="text-lg font-bold">画像を追加</h2>
        <form onSubmit={upload} className="mt-4 grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
          <label className="field-label">アングル<select className="input" name="angle"><option value="FRONT">正面</option><option value="BACK">背面</option><option value="SCREEN">画面</option><option value="OTHER">その他</option></select></label>
          <label className="field-label">画像<input className="input file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1" type="file" name="image" accept="image/jpeg,image/png,image/webp" required /></label>
          <button className="button-secondary" disabled={Boolean(busy)}>追加</button>
        </form>
      </section>
      <section className="card">
        <h2 className="text-lg font-bold">ステータス・メモ</h2>
        <div className="mt-4 flex flex-wrap gap-2">{([['PENDING','未着手'],['IN_PROGRESS','検品中'],['DONE','完了']] as const).map(([value, label]) => <button key={value} disabled={Boolean(busy) || status === value} className={status === value ? "button-primary" : "button-secondary"} onClick={() => call(`/api/inspections/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: value }) }, "ステータス更新")}>{label}</button>)}</div>
        <label className="field-label mt-5">検品メモ<textarea className="input min-h-28" value={noteValue} onChange={(event) => setNoteValue(event.target.value)} /></label>
        <button className="button-secondary mt-3" disabled={Boolean(busy)} onClick={() => call(`/api/inspections/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: noteValue }) }, "メモ保存")}>メモを保存</button>
        {message && <p aria-live="polite" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">{busy ? `${busy}中…` : message}</p>}
      </section>
    </div>
  );
}
