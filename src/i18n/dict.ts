import type { Lang } from "./config";
import * as common from "./s/common";
import * as sheet from "./s/sheet";
import * as widgets from "./s/widgets";
import * as identify from "./s/identify";
import * as home from "./s/home";
import * as species from "./s/species";
import * as rooms from "./s/rooms";

const SECTIONS = { common, sheet, widgets, identify, home, species, rooms } as const;

type Sections = typeof SECTIONS;
export type Dict = { [K in keyof Sections]: Sections[K]["en"] };

export function dict(lang: Lang): Dict {
  const out = {} as Record<string, unknown>;
  for (const [k, v] of Object.entries(SECTIONS)) out[k] = (v as Record<Lang, unknown>)[lang];
  return out as Dict;
}
