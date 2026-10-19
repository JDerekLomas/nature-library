// The library's seal: Aya, the Adinkra fern (endurance, resourcefulness), growing from an open book,
// inside a ring ticked like the Atlas globe's compass. One drawing for the header, footer, favicon and share cards.
const TICKS = Array.from({ length: 36 }, (_, i) => {
  const a = (i * Math.PI) / 18;
  const p = (r: number) => `${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(19.7)}L${p(21.6)}`;
}).join("");
// Aya: a stem, four pairs of fronds sweeping up and curling back (narrowing toward the tip), and a bud
const STEM = "M24 35.6V12.6";
const FRONDS = "M23.40 33.00C19.27 34.15 15.23 31.08 15.40 26.60C17.64 29.03 20.56 30.70 23.40 31.08ZM24.60 33.00C28.73 34.15 32.77 31.08 32.60 26.60C30.36 29.03 27.44 30.70 24.60 31.08ZM23.40 28.00C18.94 29.19 14.62 26.02 14.80 21.40C17.19 23.91 20.32 25.62 23.40 26.02ZM24.60 28.00C29.06 29.19 33.38 26.02 33.20 21.40C30.81 23.91 27.68 25.62 24.60 26.02ZM23.40 23.00C19.38 24.12 15.43 21.14 15.60 16.80C17.78 19.16 20.64 20.77 23.40 21.14ZM24.60 23.00C28.62 24.12 32.57 21.14 32.40 16.80C30.22 19.16 27.36 20.77 24.60 21.14ZM23.40 18.20C20.37 19.14 17.27 16.64 17.40 13.00C19.12 14.98 21.36 16.33 23.40 16.64ZM24.60 18.20C27.63 19.14 30.73 16.64 30.60 13.00C28.88 14.98 26.64 16.33 24.60 16.64ZM24 9.2C25.6 10.9 25.8 13 24 15.2C22.2 13 22.4 10.9 24 9.2Z";
const BOOK = "M24 36.4c-3.6-2-8.6-2.4-13.4-1.2v3.2c4.8-1.2 9.8-.8 13.4 1.2 3.6-2 8.6-2.4 13.4-1.2v-3.2c-4.8-1.2-9.8-.8-13.4 1.2z";

/** Plain SVG (no hooks, no classes), so Satori can draw it in the share images too. */
export default function Mark({ size = 32, color = "currentColor", className, ticks = true }: { size?: number; color?: string; className?: string; ticks?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="24" cy="24" r="21.6" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="19.7" strokeWidth=".55" />
      {ticks && <path d={TICKS} strokeWidth=".45" />}
      <path d={STEM} strokeWidth="1.5" />
      <path d={FRONDS} fill={color} stroke="none" />
      <path d={BOOK} strokeWidth="1.3" />
      <path d="M24 36.4v3.2" strokeWidth=".9" />
    </svg>
  );
}
