import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SettingGroupProps {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  ocid: string;
  children: ReactNode;
}

export function SettingGroup({
  step,
  title,
  description,
  icon: Icon,
  ocid,
  children,
}: SettingGroupProps) {
  return (
    <section
      data-ocid={ocid}
      aria-labelledby={`${ocid}-title`}
      className="grid gap-4 py-6 first:pt-0 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-theme">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="tabular font-mono text-[11px] font-medium text-muted-foreground">
            步骤 0{step}
          </p>
          <h2
            id={`${ocid}-title`}
            className="mt-0.5 text-base font-semibold text-foreground"
          >
            {title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="min-w-0 space-y-2">{children}</div>
    </section>
  );
}
