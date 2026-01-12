import "../globals.css";
import * as React from "react";

import { ThemeProvider } from "@/shared/shell/providers/theme-provider";

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
