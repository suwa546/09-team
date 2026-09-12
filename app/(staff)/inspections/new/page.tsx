import Link from "next/link";
import { InspectionForm } from "./inspection-form";

export default function NewInspectionPage() {
  return (
    <div>
      <Link href="/inspections" className="text-sm font-bold text-teal-700 hover:text-teal-900">← 検品履歴に戻る</Link>
      <div className="mb-7 mt-4"><p className="text-sm font-bold text-teal-700">NEW INSPECTION</p><h1 className="mt-1 text-3xl font-bold text-slate-950">新規検品登録</h1><p className="mt-2 text-slate-500">端末情報と検品画像を登録してください。</p></div>
      <InspectionForm />
    </div>
  );
}
