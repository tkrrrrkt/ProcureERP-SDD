import "./globals.css";
import * as React from "react";

import { ThemeProvider } from "@/shared/shell/providers/theme-provider";
import { QueryProvider } from "@/shared/shell/providers/query-provider";
import { AppShell } from "@/shared/shell/AppShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <AppShell>{children}</AppShell>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
