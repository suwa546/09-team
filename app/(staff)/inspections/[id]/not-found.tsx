import Link from "next/link";

export default function InspectionNotFound() {
  return <div className="card mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-bold">検品が見つかりません</h1><p className="mt-3 text-slate-500">削除されたか、URLが正しくない可能性があります。</p><Link className="button-primary mt-6" href="/inspections">検品履歴へ</Link></div>;
}
