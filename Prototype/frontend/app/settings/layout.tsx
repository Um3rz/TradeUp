"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout";
import { PageHeader } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User, Monitor } from "lucide-react";

const SETTINGS_SECTIONS = [
  { href: "/settings/account", label: "Account", icon: User },
  { href: "/settings/display", label: "Display", icon: Monitor },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell>
      <PageHeader title="Settings" description="Manage your account and preferences" />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {SETTINGS_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Link
                      key={section.href}
                      href={section.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === section.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </Link>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content pane */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
