import { Mail } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Check Your Email — RealityPicks" };

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-studio-black px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neon-cyan/10 border border-neon-cyan/20">
          <Mail className="h-8 w-8 text-neon-cyan" />
        </div>

        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
          Check Your Email
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
          We sent a magic link to your inbox. Click the link in the email to
          sign in — no password needed.
        </p>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-muted-foreground space-y-1">
          <p>Didn&apos;t get it? Check your spam folder.</p>
          <p>The link expires in 24 hours.</p>
        </div>

        <Link
          href="/auth/signin"
          className="inline-block text-sm text-neon-cyan hover:underline"
        >
          &larr; Back to sign in
        </Link>
      </div>
    </div>
  );
}
