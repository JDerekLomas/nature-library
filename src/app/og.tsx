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
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke={color} strokeWidth="1.2" />
      <ellipse cx="16" cy="16" rx="6.5" ry="14.5" fill="none" stroke={color} strokeWidth=".8" />
      <path d="M1.5 16h29M4 9h24M4 23h24" stroke={color} strokeWidth=".6" />
      <path d="M16 27c0-7 3-12 9-14-1 7-4 11-9 14z" fill={color} />
    </svg>
  );
}
