"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import {
  Cancel01Icon,
  ChartIcon,
  LayoutDashboardIcon,
  Logout01Icon,
  Menu01Icon,
  PencilEdit02Icon,
  TableIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AppIcon } from "@/components/app-icon";
import { BrandMark } from "@/components/BrandMark";
import { LanguageSwitch } from "@/components/language-switch";
import { useCopy, useLocale } from "@/components/language-provider";
import { buttonVariants } from "@/components/ui/button";
import type { Copy } from "@/lib/messages";
import { roleLabel, type Role } from "@/lib/roles";
import { cn } from "cn";

type Section = "monitor" | "manage";
type NavLabel = "overview" | "charts" | "results" | "links" | "admins";

type NavItem = {
  href: string;
  label: NavLabel;
  section: Section;
  icon: IconSvgElement;
};

const NAV: NavItem[] = [
  { href: "/", label: "overview", section: "monitor", icon: LayoutDashboardIcon },
  { href: "/michoro", label: "charts", section: "monitor", icon: ChartIcon },
  { href: "/matokeo", label: "results", section: "monitor", icon: TableIcon },
  { href: "/jaza", label: "links", section: "manage", icon: PencilEdit02Icon },
  { href: "/wasimamizi", label: "admins", section: "manage", icon: UserGroupIcon },
];

const SECTIONS: Section[] = ["monitor", "manage"];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currentLabel(pathname: string, t: Copy): string {
  const item = NAV.find((entry) => isActive(pathname, entry.href));
  return item ? t.nav[item.label] : t.nav.dashboard;
}

function NavList({
  search,
  role,
  onNavigate,
}: {
  search: string;
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const t = useCopy();
  const items = NAV.filter(
    (item) => role === "super_admin" || (item.href !== "/wasimamizi" && item.href !== "/jaza"),
  );

  return (
    <div className="flex flex-col gap-5">
      {SECTIONS.map((section) => {
        const sectionItems = items.filter((item) => item.section === section);
        if (sectionItems.length === 0) return null;
        return (
        <div key={section} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-medium text-muted-foreground">{t.nav[section]}</p>
          {sectionItems.map((item) => {
            const active = isActive(pathname, item.href);
            const href = search ? `${item.href}?${search}` : item.href;
            return (
              <Link
                key={item.href}
                href={href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <AppIcon icon={item.icon} />
                {t.nav[item.label]}
              </Link>
            );
          })}
        </div>
        );
      })}
    </div>
  );
}

function NavListWithQuery({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const search = useSearchParams().toString();
  return <NavList search={search} role={role} onNavigate={onNavigate} />;
}

function SidebarPanel({
  adminName,
  role,
  onNavigate,
  onClose,
}: {
  adminName: string;
  role: Role;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const locale = useLocale();
  const t = useCopy();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="h-2 bg-primary" aria-hidden="true" />
      <div className="h-1 bg-brand-cyan" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3 border-b border-sidebar-border px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark className="h-12" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">TACAIDS</p>
            <p className="text-sm font-medium">WAD 2026</p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
            onClick={onClose}
            aria-label={t.nav.closeMenu}
          >
            <AppIcon icon={Cancel01Icon} />
          </button>
        ) : null}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t.nav.pages}>
        <Suspense fallback={<NavList search="" role={role} onNavigate={onNavigate} />}>
          <NavListWithQuery role={role} onNavigate={onNavigate} />
        </Suspense>
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <p className="truncate px-3 text-sm font-medium">{adminName}</p>
        <p className="truncate px-3 pb-2 text-xs text-muted-foreground">{roleLabel(role, locale)}</p>
        <form action="/toka" method="post">
          <button
            type="submit"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start")}
          >
            <AppIcon icon={Logout01Icon} />
            {t.nav.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  adminName,
  role,
  children,
}: {
  adminName: string;
  role: Role;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const t = useCopy();
  const [open, setOpen] = useState(false);
  const title = currentLabel(pathname, t);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-sidebar-border md:block">
        <SidebarPanel adminName={adminName} role={role} />
      </aside>
      {open ? (
        <div className="md:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/40"
            aria-label={t.nav.closeMenu}
            onClick={() => setOpen(false)}
          />
          <aside
            id="admin-menu"
            className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border shadow-xl"
          >
            <SidebarPanel
              adminName={adminName}
              role={role}
              onNavigate={() => setOpen(false)}
              onClose={() => setOpen(false)}
            />
          </aside>
        </div>
      ) : null}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
          <div className="h-2 bg-primary" aria-hidden="true" />
          <div className="h-1 bg-brand-cyan" aria-hidden="true" />
          <div className="flex h-14 items-center gap-3 px-4 sm:px-8">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "size-11 md:hidden")}
              aria-expanded={open}
              aria-controls="admin-menu"
              onClick={() => setOpen(true)}
            >
              <AppIcon icon={Menu01Icon} />
              <span className="sr-only">{t.nav.openMenu}</span>
            </button>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">TACAIDS · WAD 2026</p>
              <h1 className="truncate text-base font-medium leading-5">{title}</h1>
            </div>
            <div className="ml-auto">
              <LanguageSwitch />
            </div>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
