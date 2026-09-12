import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { angleLabels, gradeClass, gradeLabels, networkLabels, statusClass, statusLabels } from "@/src/lib/labels";
import { InspectionActions } from "./inspection-actions";

type DefectView = { type?: string; sizeMm?: number };
function defects(value: unknown): DefectView[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is DefectView => typeof item === "object" && item !== null);
}

export default async function InspectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({ where: { id }, include: { device: true, images: { orderBy: { createdAt: "asc" } }, staff: { select: { name: true } } } });
  if (!inspection) notFound();
  const totalDefects = inspection.images.reduce((sum, image) => sum + defects(image.detectedDefects).length, 0);

  return (
    <div className="space-y-6">
      <Link href="/inspections" className="text-sm font-bold text-teal-700">← 検品履歴に戻る</Link>
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-bold text-teal-700">INSPECTION RESULT</p><h1 className="mt-1 text-3xl font-bold">{inspection.device.model}</h1><p className="mt-2 text-sm text-slate-500">検品ID: {inspection.id}</p></div><div className="flex gap-2"><span className={`rounded-full px-4 py-2 text-sm font-black ${gradeClass(inspection.grade)}`}>グレード {gradeLabels[inspection.grade]}</span><span className={`rounded-full px-4 py-2 text-sm font-bold ${statusClass(inspection.status)}`}>{statusLabels[inspection.status]}</span></div></div>
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <article className="card"><h2 className="text-lg font-bold">検品結果</h2><dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
            ['IMEI形式', inspection.imeiValid === null ? '未照会' : inspection.imeiValid ? '有効' : '無効'],
            ['通信制限', networkLabels[inspection.networkRestricted]], ['傷候補', `${totalDefects}件`], ['担当者', inspection.staff.name],
          ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold text-slate-500">{label}</dt><dd className="mt-2 font-bold">{value}</dd></div>)}</dl></article>
          <article className="card"><h2 className="text-lg font-bold">端末情報</h2><dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2"><div><dt className="text-xs font-bold text-slate-500">ストレージ</dt><dd className="mt-1 font-bold">{inspection.device.storageGb} GB</dd></div><div><dt className="text-xs font-bold text-slate-500">IMEI</dt><dd className="mt-1 font-mono">{inspection.device.imei}</dd></div><div><dt className="text-xs font-bold text-slate-500">バッテリー最大容量</dt><dd className="mt-1 font-bold">{inspection.batteryHealth === null ? '未入力' : `${inspection.batteryHealth}%`}</dd></div><div><dt className="text-xs font-bold text-slate-500">充電回数</dt><dd className="mt-1 font-bold">{inspection.chargeCycles === null ? '未入力' : `${inspection.chargeCycles}回`}</dd></div></dl></article>
          <article className="card"><h2 className="text-lg font-bold">検品画像</h2>{inspection.images.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2">{inspection.images.map((item) => { const found = defects(item.detectedDefects); return <figure key={item.id} className="overflow-hidden rounded-2xl border border-slate-200"><div className="relative aspect-[4/3] bg-slate-100"><Image src={item.imageUrl} alt={`${angleLabels[item.angle]}の検品画像`} fill unoptimized className="object-contain" /></div><figcaption className="flex items-center justify-between p-3 text-sm"><strong>{angleLabels[item.angle]}</strong><span className="text-slate-500">傷候補 {found.length}件</span></figcaption>{found.length > 0 && <ul className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">{found.slice(0, 4).map((defect, index) => <li key={index}>{defect.type ?? 'defect'} · {defect.sizeMm ?? '-'}mm</li>)}</ul>}</figure>; })}</div> : <p className="mt-5 rounded-xl bg-slate-50 py-12 text-center text-sm text-slate-500">画像はまだ登録されていません。</p>}</article>
        </div>
        <InspectionActions id={inspection.id} status={inspection.status} notes={inspection.notes ?? ""} hasImages={inspection.images.length > 0} />
      </section>
    </div>
  );
}
