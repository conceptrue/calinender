"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Apple, Activity, Menu, X, ChefHat } from "lucide-react";

export type ViewType = "kalender" | "voeding" | "beweging" | "recepten";

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: "kalender", label: "Kalender", icon: Calendar },
  { id: "voeding", label: "Voeding", icon: Apple },
  { id: "beweging", label: "Beweging", icon: Activity },
  { id: "recepten", label: "Recepten", icon: ChefHat },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
          // Desktop: collapsed (64px) or expanded (280px) on hover
          "md:w-16 md:hover:w-70",
          // Mobile: hidden by default, full width when open
          isMobileOpen ? "w-70 translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          {/* Logo icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>

          {/* App name - visible when expanded */}
          <div className={cn(
            "ml-3 overflow-hidden transition-all duration-300",
            isExpanded || isMobileOpen ? "opacity-100 w-auto" : "opacity-0 w-0 md:group-hover:opacity-100"
          )}>
            <p className="font-semibold text-sidebar-foreground whitespace-nowrap">
              Menstruatiekalender
            </p>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Privé & lokaal
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

                    <span className={cn(
                      "whitespace-nowrap transition-all duration-300",
                      isExpanded || isMobileOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                    )}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t border-sidebar-border transition-all duration-300",
          isExpanded || isMobileOpen ? "opacity-100" : "opacity-0"
        )}>
          <p className="text-xs text-muted-foreground">
            Alle data blijft lokaal
          </p>
        </div>
      </aside>
    </>
  );
}
