import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "WAD 2026 | Ufuatiliaji wa Kanda, Mkoa na Halmashauri",
  description:
    "Dashibodi na fomu ya ufuatiliaji wa utekelezaji wa kila siku wa WAD 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
