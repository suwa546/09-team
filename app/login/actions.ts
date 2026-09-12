"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function authenticate(_state: string | undefined, formData: FormData): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) return "メールアドレスまたはパスワードが違います。";
    throw error;
  }
}
