"use client";

import Image from "next/image";
import { useCopy } from "@/components/language-provider";
import { cn } from "cn";

export function BrandMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const t = useCopy();
  return (
    <Image
      src="/tacaids.png"
      alt={t.brand.alt}
      width={934}
      height={1024}
      priority={priority}
      className={cn("h-16 w-auto", className)}
    />
  );
}

export function BrandLockup({
  title,
  priority = false,
}: {
  title: string;
  priority?: boolean;
}) {
  const t = useCopy();
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <BrandMark priority={priority} className="h-28 sm:h-32" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-primary">TACAIDS · WAD 2026</p>
        <h1 className="text-xl font-medium">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          {t.brand.org}
        </p>
      </div>
    </div>
  );
}
