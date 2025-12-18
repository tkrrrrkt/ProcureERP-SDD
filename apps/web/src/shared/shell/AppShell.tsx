"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { menu, type MenuItem } from "@/shared/navigation/menu";
import { ScrollArea } from "@/shared/ui/components/scroll-area";
import { Separator } from "@/shared/ui/components/separator";
import { Button } from "@/shared/ui/components/button";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold">EPM</div>
        <div className="text-xs text-muted-foreground">Trial</div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          Help
        </Button>
        <Button variant="secondary" size="sm">
          Settings
        </Button>
      </div>
    </header>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      <div className="px-4 py-3">
        <div className="text-xs font-semibold text-muted-foreground">MENU</div>
      </div>
      <Separator />

      {/* calc() をやめて flex レイアウトで高さを自然に埋める */}
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <nav className="px-2 py-3">
            {menu.map((node) => (
              <NavNode key={node.id} node={node} pathname={pathname} />
            ))}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}

function NavNode({
  node,
  pathname,
}: {
  node: MenuItem;
  pathname: string;
}) {
  const hasChildren = !!node.children?.length;

  // group node
  if (hasChildren) {
    return (
      <div className="mb-2">
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
          {node.label}
        </div>
        <div className="space-y-1">
          {node.children!.map((child) => (
            <NavNode key={child.id} node={child} pathname={pathname} />
          ))}
        </div>
      </div>
    );
  }

  // leaf node
  const href = node.path ?? "#";
  const active = href !== "#" && pathname === href;

  return (
    <Link
      href={href}
      className={[
        "block rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
      ].join(" ")}
    >
      {node.label}
    </Link>
  );
}
