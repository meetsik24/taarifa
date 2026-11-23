"use client";

import { createContext, useContext, type ReactNode } from "react";
import { copy, type Copy, type Locale } from "@/lib/messages";

const LanguageContext = createContext<Locale>("sw");

export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return <LanguageContext.Provider value={locale}>{children}</LanguageContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LanguageContext);
}

export function useCopy(): Copy {
  return copy[useLocale()];
}
