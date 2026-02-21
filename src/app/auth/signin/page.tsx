import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SignInClient } from "./signin-client";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // If redirected here due to an error, always show the form
  const hasError = searchParams?.error;

  if (!hasError) {
    try {
      const session = await getSession();
      if (session?.user) {
        redirect("/dashboard");
      }
    } catch {
      // Session check failed — show login form anyway
    }
  }

  return <SignInClient />;
}
