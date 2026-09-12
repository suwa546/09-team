"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Angle = "FRONT" | "BACK" | "SCREEN";

export function InspectionForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<Record<Angle, File | null>>({ FRONT: null, BACK: null, SCREEN: null });
  const [model, setModel] = useState("");
  const [storageGb, setStorageGb] = useState("128");
  const [imei, setImei] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("");
  const [chargeCycles, setChargeCycles] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectMessage, setDetectMessage] = useState("USB接続された端末を確認しています…");

  const detectDevice = useCallback(async () => {
    setDetecting(true);
    try {
      const response = await fetch("/api/device-detect", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "端末情報を取得できませんでした");
      if (!result.connected) { setDetectMessage(result.message ?? "端末が見つかりません。手入力で登録できます。"); return; }
      if (result.model) setModel(result.model);
      if (result.storageGb) setStorageGb(String(result.storageGb));
      if (result.imei) setImei(result.imei);
      if (result.batteryHealth !== null) setBatteryHealth(String(result.batteryHealth));
      if (result.chargeCycles !== null) setChargeCycles(String(result.chargeCycles));
      const platform = result.platform === "android" ? "Android" : "iPhone";
      setDetectMessage(result.missingFields?.length ? `${platform}を検出しました。取得できない項目は手入力してください。` : `${platform}の端末情報を自動入力しました。`);
    } catch (reason) {
      setDetectMessage(reason instanceof Error ? `${reason.message} 手入力で登録できます。` : "端末情報を取得できませんでした。手入力で登録できます。");
    } finally { setDetecting(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void detectDevice(), 0);
    return () => window.clearTimeout(timer);
  }, [detectDevice]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(["model", "storageGb", "imei", "batteryHealth", "chargeCycles", "notes"].map((key) => [key, form.get(key)]));
    try {
      const response = await fetch("/api/inspections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "登録に失敗しました");

      for (const [angle, file] of Object.entries(images)) {
        if (!file) continue;
        const upload = new FormData(); upload.set("angle", angle); upload.set("image", file);
        const uploadResponse = await fetch(`/api/inspections/${result.inspection.id}/images`, { method: "POST", body: upload });
        if (!uploadResponse.ok) throw new Error(`${angle}画像の保存に失敗しました`);
      }
      router.push(`/inspections/${result.inspection.id}`);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "登録に失敗しました");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">端末情報</h2><p className="mt-1 text-xs text-slate-500">自動入力された内容も自由に修正できます。</p></div><button type="button" className="button-secondary text-sm" disabled={detecting} onClick={detectDevice}>{detecting ? "検出中…" : "USB端末を再検出"}</button></div>
        <p aria-live="polite" className="mt-4 rounded-xl bg-teal-50 px-4 py-3 text-sm font-bold text-teal-800">{detectMessage}</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="field-label">モデル名<input className="input" name="model" placeholder="例: iPhone 15 Pro" required value={model} onChange={(event) => setModel(event.target.value)} /></label>
          <label className="field-label">ストレージ容量<select className="input" name="storageGb" value={storageGb} onChange={(event) => setStorageGb(event.target.value)}><option value="16">16 GB</option><option value="32">32 GB</option><option value="64">64 GB</option><option value="128">128 GB</option><option value="256">256 GB</option><option value="512">512 GB</option><option value="1024">1 TB</option><option value="2048">2 TB</option></select></label>
          <label className="field-label sm:col-span-2">IMEI<input className="input font-mono" name="imei" inputMode="numeric" pattern="[0-9]{15}" minLength={15} maxLength={15} placeholder="15桁の数字" required value={imei} onChange={(event) => setImei(event.target.value.replace(/\D/g, "").slice(0, 15))} /></label>
          <label className="field-label">バッテリー最大容量（%）<input className="input" name="batteryHealth" type="number" min="0" max="100" placeholder="例: 87" value={batteryHealth} onChange={(event) => setBatteryHealth(event.target.value)} /></label>
          <label className="field-label">充電回数<input className="input" name="chargeCycles" type="number" min="0" placeholder="例: 320" value={chargeCycles} onChange={(event) => setChargeCycles(event.target.value)} /></label>
          <label className="field-label sm:col-span-2">メモ<textarea className="input min-h-24 resize-y" name="notes" placeholder="付属品や外観についての補足" /></label>
        </div>
      </section>
      <section className="card">
        <h2 className="text-lg font-bold">検品画像 <span className="text-sm font-normal text-slate-500">（任意・後から追加できます）</span></h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {([['FRONT','正面'],['BACK','背面'],['SCREEN','画面']] as const).map(([angle, label]) => (
            <label key={angle} className="grid min-h-36 place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm font-bold text-slate-600 hover:border-teal-400 hover:bg-teal-50">
              <span>{images[angle] ? images[angle]!.name : `＋ ${label}画像を選択`}</span>
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImages((old) => ({ ...old, [angle]: event.target.files?.[0] ?? null }))} />
            </label>
          ))}
        </div>
      </section>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      <div className="flex justify-end"><button className="button-primary min-w-40" disabled={busy}>{busy ? "登録中…" : "検品を登録"}</button></div>
    </form>
  );
}
