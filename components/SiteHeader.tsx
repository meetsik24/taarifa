import {
  DashboardSquare01Icon,
  Logout01Icon,
  PencilEdit02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { logout } from "@/app/ingia/actions";
import { AppIcon } from "@/components/app-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export function SiteHeader({
  active,
  showDashboard = false,
  adminName,
}: {
  active: "dashboard" | "form" | "login" | "admins";
  showDashboard?: boolean;
  adminName?: string;
}) {
  const title =
    active === "form"
      ? "Ufuatiliaji wa kila siku"
      : active === "login"
        ? "Ingia"
        : active === "admins"
          ? "Wasimamizi"
          : "Dashibodi ya ufuatiliaji wa Kanda / Mkoa / Halmashauri";
  const showAdminNav = active === "dashboard" || active === "admins" || showDashboard;

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-8 md:min-h-16 md:flex-row md:items-center md:justify-between md:py-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-white/75">WAD 2026</p>
          <h1 className="text-lg leading-6 font-medium sm:text-xl sm:leading-7">{title}</h1>
        </div>
        {showAdminNav ? (
          <nav className="grid grid-cols-2 gap-2 md:flex md:shrink-0" aria-label="Kurasa">
            <Link
              href="/"
              aria-current={active === "dashboard" ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-white hover:bg-white/10 hover:text-white",
                active === "dashboard" && "bg-white/15",
              )}
            >
              <AppIcon icon={DashboardSquare01Icon} />
              Dashibodi
            </Link>
            <Link
              href="/form"
              aria-current={active === "form" ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "bg-white text-primary hover:bg-secondary hover:text-primary",
                active === "form" && "bg-secondary",
              )}
            >
              <AppIcon icon={PencilEdit02Icon} />
              Jaza taarifa
            </Link>
            <Link
              href="/wasimamizi"
              aria-current={active === "admins" ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-white hover:bg-white/10 hover:text-white",
                active === "admins" && "bg-white/15",
              )}
            >
              <AppIcon icon={UserGroupIcon} />
              Wasimamizi
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full text-white hover:bg-white/10 hover:text-white",
                )}
              >
                <AppIcon icon={Logout01Icon} />
                {adminName ? `Toka, ${adminName}` : "Toka"}
              </button>
            </form>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
