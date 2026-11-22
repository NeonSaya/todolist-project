export const BRAND_NAME = "拾序";
export const BRAND_TAGLINE = "把纷乱拾成秩序";

/** Porcelain/jade seal tile carrying the 拾 glyph. */
export function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box =
    size === "sm"
      ? "h-9 w-9 rounded-[10px] text-base"
      : "h-10 w-10 rounded-xl text-lg";
  return (
    <span
      aria-hidden
      className={`${box} relative inline-flex shrink-0 items-center justify-center bg-sidebar-accent font-display font-bold text-sidebar-accent-foreground shadow-xs transition-theme`}
    >
      <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_oklch(var(--primary)/0.18)]" />
      {BRAND_NAME.slice(0, 1)}
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <LogoMark size={compact ? "sm" : "md"} />
      <div className="min-w-0 leading-tight">
        <p
          className={`truncate font-display font-semibold tracking-tight text-foreground ${compact ? "text-base" : "text-lg"}`}
        >
          {BRAND_NAME}
        </p>
        <p
          className={`truncate tracking-wide text-muted-foreground ${compact ? "text-[11px]" : "mt-0.5 text-xs"}`}
        >
          {BRAND_TAGLINE}
        </p>
      </div>
    </div>
  );
}
