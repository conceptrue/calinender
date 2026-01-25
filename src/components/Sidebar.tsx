"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";
import { Calendar, Apple, Activity, Menu, X, ChefHat, Baby, Settings } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

export type ViewType = "kalender" | "voeding" | "beweging" | "recepten" | "zwanger";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSettingsClick: () => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar({ activeView, onViewChange, onSettingsClick }: SidebarProps) {
  const { t } = useTranslation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = useMemo(() => [
    { id: "kalender", label: t.nav.calendar, icon: Calendar },
    { id: "voeding", label: t.nav.nutrition, icon: Apple },
    { id: "beweging", label: t.nav.exercise, icon: Activity },
    { id: "recepten", label: t.nav.recipes, icon: ChefHat },
    { id: "zwanger", label: t.nav.pregnancy, icon: Baby },
  ], [t]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-md border md:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          // Desktop: always expanded (200px)
          "md:w-52",
          // Mobile: hidden by default, full width when open
          isMobileOpen ? "w-70 translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          {/* Logo icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>

          {/* App name - always visible on desktop */}
          <div className="ml-3">
            <p className="font-semibold text-sidebar-foreground whitespace-nowrap">
              {t.app.name}
            </p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {t.app.tagline}
            </p>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="ml-auto p-1 rounded md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-rose-500 rounded-r-full" />
                    )}

                    <Icon className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive && "text-rose-500"
                    )} />

                    <span className="whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {t.app.dataLocal}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {t.app.version}{APP_VERSION}
              </p>
            </div>
            <button
              onClick={() => {
                onSettingsClick();
                setIsMobileOpen(false);
              }}
              className="p-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              aria-label={t.nav.settings}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
