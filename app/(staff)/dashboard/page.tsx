import Link from "next/link";
import { prisma } from "@/src/lib/prisma";

export default async function DashboardPage() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [total, todayCount, grades, pending, completed, recent] = await Promise.all([
    prisma.inspection.count(), prisma.inspection.count({ where: { startedAt: { gte: today } } }),
    prisma.inspection.groupBy({ by: ["grade"], _count: { _all: true } }),
    prisma.inspection.count({ where: { status: { not: "DONE" } } }),
    prisma.inspection.findMany({ where: { completedAt: { not: null } }, select: { startedAt: true, completedAt: true } }),
    prisma.inspection.findMany({ take: 5, orderBy: { startedAt: "desc" }, include: { device: true } }),
  ]);
  const gradeCounts = Object.fromEntries(grades.map((item) => [item.grade, item._count._all])) as Record<string, number>;
  const averageMinutes = completed.length ? Math.round(completed.reduce((sum, item) => sum + ((item.completedAt?.getTime() ?? item.startedAt.getTime()) - item.startedAt.getTime()), 0) / completed.length / 60000) : 0;
  const maxGrade = Math.max(1, gradeCounts.A ?? 0, gradeCounts.B ?? 0, gradeCounts.C ?? 0);

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-teal-700">OVERVIEW</p><h1 className="mt-1 text-3xl font-bold">ダッシュボード</h1><p className="mt-2 text-slate-500">検品状況をひと目で確認できます。</p></div><Link className="button-primary" href="/inspections/new">＋ 新規検品</Link></div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['総検品件数', total, '件'], ['本日の検品', todayCount, '件'], ['対応待ち', pending, '件'], ['平均処理時間', averageMinutes, '分']].map(([label, value, unit]) => (
          <article className="card" key={label}><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-3 text-3xl font-black text-slate-950">{value}<span className="ml-1 text-base font-bold text-slate-400">{unit}</span></p></article>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <article className="card"><h2 className="text-lg font-bold">グレード分布</h2><div className="mt-6 space-y-5">{(['A','B','C'] as const).map((grade) => <div key={grade} className="grid grid-cols-[2rem_1fr_3rem] items-center gap-3"><span className="font-black">{grade}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${grade === 'A' ? 'bg-emerald-500' : grade === 'B' ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${((gradeCounts[grade] ?? 0) / maxGrade) * 100}%` }} /></div><span className="text-right text-sm font-bold">{gradeCounts[grade] ?? 0}件</span></div>)}</div></article>
        <article className="card"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">最近の検品</h2><Link className="text-sm font-bold text-teal-700" href="/inspections">すべて見る →</Link></div><div className="mt-4 divide-y divide-slate-100">{recent.length ? recent.map((item) => <Link key={item.id} href={`/inspections/${item.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"><div><p className="font-bold">{item.device.model}</p><p className="mt-1 text-xs text-slate-500">{item.device.storageGb}GB · {item.startedAt.toLocaleDateString('ja-JP')}</p></div><span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-black">{item.grade === 'UNRATED' ? '未判定' : item.grade}</span></Link>) : <p className="py-10 text-center text-sm text-slate-500">検品データはまだありません。</p>}</div></article>
      </section>
    </div>
  );
}
