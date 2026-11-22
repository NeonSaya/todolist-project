"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();
  const theme: ToasterProps["theme"] =
    resolvedTheme === "dark" ? "dark" : "light";

  return (
    <Sonner
      theme={theme}
      className="toaster group font-body"
      style={
        {
          "--normal-bg": "oklch(var(--popover))",
          "--normal-text": "oklch(var(--popover-foreground))",
          "--normal-border": "oklch(var(--border))",
          "--border-radius": "0.875rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
