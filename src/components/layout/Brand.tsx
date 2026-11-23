export const BRAND_NAME = "拾序";
export const BRAND_TAGLINE = "把纷乱拾成秩序";

/** A single stepped stroke: scattered work gathered into an upward order. */
export function LogoMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-9 w-9 rounded-[10px]" : "h-10 w-10 rounded-xl";
  const icon = size === "sm" ? "h-[23px] w-[23px]" : "h-[25px] w-[25px]";
  return (
    <span
      aria-hidden
      className={`${box} relative inline-flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-xs transition-theme`}
    >
      <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_oklch(1_0_0/0.18)]" />
      <svg
        viewBox="0 0 64 64"
        className={icon}
        fill="none"
        role="img"
        aria-hidden="true"
      >
        <title>拾序标识</title>
        <path
          d="M13 46h15V35h13V24h10"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5.6"
        />
      </svg>
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
