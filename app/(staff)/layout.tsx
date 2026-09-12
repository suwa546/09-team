import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-600 font-black text-white">検</span>
            <span><strong className="block text-slate-950">スマートフォン検品システム</strong><small className="text-slate-500">検品・査定業務をサポート</small></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="メインナビゲーション">
            <Link className="nav-link" href="/dashboard">ダッシュボード</Link><Link className="nav-link" href="/inspections">検品履歴</Link><Link className="button-primary" href="/inspections/new">新規検品</Link>
          </nav>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}><button className="button-secondary text-sm">ログアウト</button></form>
        </div>
        <nav className="flex justify-center gap-1 border-t border-slate-100 px-3 py-2 md:hidden" aria-label="モバイルナビゲーション"><Link className="nav-link" href="/dashboard">集計</Link><Link className="nav-link" href="/inspections">履歴</Link><Link className="nav-link" href="/inspections/new">新規</Link></nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
