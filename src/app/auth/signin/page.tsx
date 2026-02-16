import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignInClient } from "./signin-client";

export default async function SignInPage() {
  // Server-side check: if already authenticated, go straight to dashboard.
  // This prevents the sign-in page from ever rendering for logged-in users.
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return <SignInClient />;
}
