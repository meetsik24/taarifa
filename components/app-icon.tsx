import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "cn";

export function AppIcon({
  icon,
  className,
}: {
  icon: IconSvgElement;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={16}
      strokeWidth={1.5}
      color="currentColor"
      className={cn("size-4 shrink-0", className)}
    />
  );
}
