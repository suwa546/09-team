import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await auth()) redirect("/dashboard");
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-bold tracking-[0.2em] text-teal-600">SMARTPHONE INSPECTION</p>
          <h1 className="text-3xl font-bold text-slate-950">スマートフォン検品システム</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">中古スマートフォンの検査と査定を、正確かつスムーズに。</p>
        </div>
        <LoginForm />
        <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">デモアカウント: staff@example.com / staff1234</p>
      </section>
    </main>
  );
}
