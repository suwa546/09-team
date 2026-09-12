import { z } from "zod";

const optionalInteger = (min: number, max?: number) =>
  z.preprocess(
    (value) => value === "" || value === null || value === undefined ? undefined : Number(value),
    z.number().int().min(min).max(max ?? Number.MAX_SAFE_INTEGER).optional(),
  );

export const createInspectionSchema = z.object({
  model: z.string().trim().min(1, "モデル名を入力してください").max(100),
  storageGb: z.coerce.number().int().min(1).max(4096),
  imei: z.string().trim().regex(/^\d{15}$/, "IMEIは15桁の数字で入力してください"),
  batteryHealth: optionalInteger(0, 100),
  chargeCycles: optionalInteger(0, 100000),
  notes: z.string().trim().max(2000).optional(),
});

export const updateInspectionSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]).optional(),
  batteryHealth: optionalInteger(0, 100),
  chargeCycles: optionalInteger(0, 100000),
  notes: z.string().trim().max(2000).nullable().optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: "更新項目がありません",
});

export function validationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "入力内容を確認してください";
}
