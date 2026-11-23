import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import { getCopy, getLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getCopy();
  return {
    title: t.meta.title,
    description: t.meta.description,
    icons: {
      icon: [{ url: "/tacaids.png", type: "image/png" }],
      shortcut: "/tacaids.png",
      apple: "/tacaids.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider locale={locale}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
