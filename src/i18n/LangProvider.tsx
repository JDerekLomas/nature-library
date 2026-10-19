"use client";

import { createContext, useContext } from "react";
import type { Lang } from "./config";
import { dict, type Dict } from "./dict";

const Ctx = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
export const useT = (): Dict => dict(useContext(Ctx));
