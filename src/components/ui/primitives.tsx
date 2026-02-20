import { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-4xl px-4 py-16 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-7xl px-4 ${className}`}>{children}</div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold mb-2">
      {children}
    </p>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase text-white">
      {children}
    </h2>
  );
}

export function StatPill({
  value,
  label,
  live,
}: {
  value: string;
  label: string;
  live?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
      <p className="text-xl font-bold font-mono text-neon-cyan">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 flex items-center justify-center gap-1">
        {label}
        {live && (
          <span className="inline-flex items-center gap-0.5 text-neon-cyan/50">
            <span className="h-1 w-1 rounded-full bg-neon-cyan/50 animate-pulse" />
            live
          </span>
        )}
      </p>
    </div>
  );
}
