import Mark from "@/components/Mark";
// Shared pieces for share-card images (Open Graph / Twitter)
import fs from "node:fs";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

export function ogFonts() {
  const dir = path.join(process.cwd(), "src/app/fonts");
  return [
    { name: "Fell", data: fs.readFileSync(path.join(dir, "IMFellEnglish-Regular.ttf")), style: "normal" as const, weight: 400 as const },
    { name: "Fell", data: fs.readFileSync(path.join(dir, "IMFellEnglish-Italic.ttf")), style: "italic" as const, weight: 400 as const },
  ];
}

export function Seal({ size = 64, color = "#2e4a32" }: { size?: number; color?: string }) {
  return <Mark size={size} color={color} ticks={size >= 48} />;
}
