import type { Grade, Prisma, Status } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { gradeClass, gradeLabels, statusClass, statusLabels } from "@/src/lib/labels";

type Search = Promise<Record<string, string | string[] | undefined>>;
const value = (input: string | string[] | undefined) => typeof input === "string" ? input : "";

export default async function InspectionsPage({ searchParams }: { searchParams: Search }) {
  const query = await searchParams;
  const search = value(query.search); const grade = value(query.grade); const status = value(query.status); const from = value(query.from); const to = value(query.to);
  const where: Prisma.InspectionWhereInput = {};
  if (["A", "B", "C", "UNRATED"].includes(grade)) where.grade = grade as Grade;
  if (["PENDING", "IN_PROGRESS", "DONE"].includes(status)) where.status = status as Status;
  if (search) where.device = { OR: [{ model: { contains: search } }, { imei: { contains: search } }] };
  if (from || to) { where.startedAt = {}; if (from) where.startedAt.gte = new Date(`${from}T00:00:00`); if (to) where.startedAt.lte = new Date(`${to}T23:59:59.999`); }
  const inspections = await prisma.inspection.findMany({ where, include: { device: true, _count: { select: { images: true } } }, orderBy: { startedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-teal-700">INSPECTIONS</p><h1 className="mt-1 text-3xl font-bold">検品履歴</h1><p className="mt-2 text-slate-500">{inspections.length}件の検品が見つかりました。</p></div><Link className="button-primary" href="/inspections/new">＋ 新規検品</Link></div>
      <form className="card grid gap-4 md:grid-cols-5" action="/inspections">
        <label className="field-label md:col-span-2">キーワード<input name="search" className="input" placeholder="モデル名・IMEI" defaultValue={search} /></label>
        <label className="field-label">グレード<select name="grade" className="input" defaultValue={grade}><option value="">すべて</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="UNRATED">未判定</option></select></label>
        <label className="field-label">ステータス<select name="status" className="input" defaultValue={status}><option value="">すべて</option><option value="PENDING">未着手</option><option value="IN_PROGRESS">検品中</option><option value="DONE">完了</option></select></label>
        <div className="flex items-end gap-2"><button className="button-primary flex-1">検索</button><Link className="button-secondary" href="/inspections">解除</Link></div>
        <label className="field-label">開始日<input className="input" name="from" type="date" defaultValue={from} /></label><label className="field-label">終了日<input className="input" name="to" type="date" defaultValue={to} /></label>
      </form>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-4">端末</th><th className="px-5 py-4">IMEI</th><th className="px-5 py-4">グレード</th><th className="px-5 py-4">状態</th><th className="px-5 py-4">画像</th><th className="px-5 py-4">登録日</th><th className="px-5 py-4" /></tr></thead><tbody className="divide-y divide-slate-100">{inspections.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-4"><strong className="block">{item.device.model}</strong><span className="text-xs text-slate-500">{item.device.storageGb} GB</span></td><td className="px-5 py-4 font-mono text-xs">{item.device.imei}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${gradeClass(item.grade)}`}>{gradeLabels[item.grade]}</span></td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(item.status)}`}>{statusLabels[item.status]}</span></td><td className="px-5 py-4">{item._count.images}枚</td><td className="px-5 py-4 text-slate-500">{item.startedAt.toLocaleDateString('ja-JP')}</td><td className="px-5 py-4"><Link className="font-bold text-teal-700" href={`/inspections/${item.id}`}>詳細 →</Link></td></tr>)}</tbody></table></div>
        {!inspections.length && <p className="px-6 py-16 text-center text-slate-500">条件に一致する検品はありません。</p>}
      </section>
    </div>
  );
}
