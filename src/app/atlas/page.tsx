import type { Metadata } from "next";
import AtlasClient from "./AtlasClient";

export const metadata: Metadata = { title: "Atlas of Life", description: "A turning globe of every recorded living thing. Tap anywhere to see what lives there." };

export default function AtlasPage() {
  return <AtlasClient />;
}
