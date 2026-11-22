import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { type ReactNode, useEffect } from "react";

export const THEME_STORAGE_KEY = "shixu-theme";

/** Browser chrome colors matching --background in each theme. */
const THEME_COLORS = { light: "#f4f6f9", dark: "#0e1116" } as const;

function ThemeMetaSync() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.setAttribute("content", THEME_COLORS[resolvedTheme]);
    }
  }, [resolvedTheme]);
  return null;
}

/** Class-based theming that follows the system by default and remembers the user's choice. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
    >
      <ThemeMetaSync />
      {children}
    </NextThemesProvider>
  );
}
