import type { Metadata } from "next";
import AtlasClient from "./AtlasClient";
import { asLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.atlas;
  return { title: t.title, description: t.metaDesc };
}

export default function AtlasPage() {
  return <AtlasClient />;
}
