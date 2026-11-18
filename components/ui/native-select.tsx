import type { ComponentProps } from "react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/app-icon";
import { cn } from "cn";

export function NativeSelect({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          "h-11 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-10 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:h-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <AppIcon
        icon={ArrowDown01Icon}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
