import type { Grade, ImageAngle, NetworkStatus, Status } from "@prisma/client";

export const gradeLabels: Record<Grade, string> = { A: "A", B: "B", C: "C", UNRATED: "未判定" };
export const statusLabels: Record<Status, string> = { PENDING: "未着手", IN_PROGRESS: "検品中", DONE: "完了" };
export const networkLabels: Record<NetworkStatus, string> = { OK: "制限なし", RESTRICTED: "利用制限あり", UNKNOWN: "未照会" };
export const angleLabels: Record<ImageAngle, string> = { FRONT: "正面", BACK: "背面", SCREEN: "画面", OTHER: "その他" };

export function gradeClass(grade: Grade) {
  return grade === "A" ? "bg-emerald-100 text-emerald-800" : grade === "B" ? "bg-blue-100 text-blue-800" : grade === "C" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600";
}

export function statusClass(status: Status) {
  return status === "DONE" ? "bg-emerald-100 text-emerald-800" : status === "IN_PROGRESS" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600";
}
