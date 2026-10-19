// The library's seal: a tree of life, branching as in Darwin's 1837 notebook sketch, growing from an open book,
// inside a ring ticked like the Atlas globe's compass. One drawing for the header, footer, favicon and share cards.
const TICKS = Array.from({ length: 36 }, (_, i) => {
  const a = (i * Math.PI) / 18;
  const p = (r: number) => `${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(19.7)}L${p(21.6)}`;
}).join("");
const BRANCHES =
  "M24 35.2V26.6 M24 26.6C22 25.5 19.3 23.6 17.6 20.4 M24 26.6C26 25.5 28.7 23.6 30.4 20.4 M24 26.6V11.2 " +
  "M17.6 20.4C16.2 18.9 14.6 17.6 12.9 16.9 M17.6 20.4C17.6 17.8 18.2 15.3 19.3 13.2 " +
  "M30.4 20.4C31.8 18.9 33.4 17.6 35.1 16.9 M30.4 20.4C30.4 17.8 29.8 15.3 28.7 13.2";
const TIPS: [number, number][] = [
  [12.9, 16.9],
  [19.3, 13.2],
  [24, 11.2],
  [28.7, 13.2],
  [35.1, 16.9],
];
const BOOK = "M24 36.4c-3.6-2-8.6-2.4-13.4-1.2v3.2c4.8-1.2 9.8-.8 13.4 1.2 3.6-2 8.6-2.4 13.4-1.2v-3.2c-4.8-1.2-9.8-.8-13.4 1.2z";

/** Plain SVG (no hooks, no classes), so Satori can draw it in the share images too. */
export default function Mark({ size = 32, color = "currentColor", className, ticks = true }: { size?: number; color?: string; className?: string; ticks?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="24" cy="24" r="21.6" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="19.7" strokeWidth=".55" />
      {ticks && <path d={TICKS} strokeWidth=".45" />}
      <path d={BRANCHES} strokeWidth="1.45" />
      {TIPS.map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="1.55" fill={color} stroke="none" />
      ))}
      <path d={BOOK} strokeWidth="1.3" />
      <path d="M24 36.4v3.2" strokeWidth=".9" />
    </svg>
  );
}
