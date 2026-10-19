// The library's seal: Aya, the Adinkra symbol of the fern (endurance and resourcefulness), drawn after the
// traditional form, inside a ring ticked like the Atlas globe's compass. One drawing for header, footer, favicon and share cards.
const TICKS = Array.from({ length: 36 }, (_, i) => {
  const a = (i * Math.PI) / 18;
  const p = (r: number) => `${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
  return `M${p(19.7)}L${p(21.6)}`;
}).join("");

// Aya in its own 500 x 640 drawing space (stem at x 250): stem, eight pairs of fronds, their rounded tips, and the two loops
export const AYA = {
  stem: "M250 14V452",
  fronds: "M250.0 32.0C245.7 5.1 176.0 2.9 164.0 26.0M250.0 32.0C254.3 5.1 324.0 2.9 336.0 26.0M250.0 83.5C244.6 39.2 157.1 36.8 142.0 62.0M250.0 83.5C255.4 39.2 342.9 36.8 358.0 62.0M250.0 127.0C243.7 78.3 140.8 75.7 123.0 104.0M250.0 127.0C256.4 78.3 359.2 75.7 377.0 104.0M250.0 176.5C242.8 123.5 125.3 120.5 105.0 152.0M250.0 176.5C257.2 123.5 374.7 120.5 395.0 152.0M250.0 232.0C241.9 174.7 110.7 171.3 88.0 206.0M250.0 232.0C258.1 174.7 389.3 171.3 412.0 206.0M250.0 291.5C241.0 229.8 95.2 226.2 70.0 264.0M250.0 291.5C259.0 229.8 404.8 226.2 430.0 264.0M250.0 357.0C240.0 290.0 78.0 286.0 50.0 328.0M250.0 357.0C260.0 290.0 422.0 286.0 450.0 328.0M250.0 432.5C238.9 360.2 59.1 355.8 28.0 402.0M250.0 432.5C261.1 360.2 440.9 355.8 472.0 402.0",
  tips: [[164.0, 30.4, 12.5, 14.0], [336.0, 30.4, 12.5, 14.0], [142.0, 66.7, 13.3, 15.0], [358.0, 66.7, 13.3, 15.0], [123.0, 109.0, 14.2, 15.9], [377.0, 109.0, 14.2, 15.9], [105.0, 157.3, 15.1, 16.9], [395.0, 157.3, 15.1, 16.9], [88.0, 211.6, 15.9, 17.8], [412.0, 211.6, 15.9, 17.8], [70.0, 269.9, 16.8, 18.8], [430.0, 269.9, 16.8, 18.8], [50.0, 334.2, 17.6, 19.7], [450.0, 334.2, 17.6, 19.7], [28.0, 408.5, 18.4, 20.7], [472.0, 408.5, 18.4, 20.7]] as [number, number, number, number][],
  loops: "M250.0 448C196.0 426 70.0 432 36.0 505C10.0 566 80.0 618 160.0 600C222.0 584 246.0 520 250.0 448ZM236.0 466C198.0 452 98.0 458 70.0 510C52.0 552 104.0 584 158.0 572C206.0 560 230.0 512 236.0 466ZM250.0 448C304.0 426 430.0 432 464.0 505C490.0 566 420.0 618 340.0 600C278.0 584 254.0 520 250.0 448ZM264.0 466C302.0 452 402.0 458 430.0 510C448.0 552 396.0 584 342.0 572C294.0 560 270.0 512 264.0 466Z",
};

/** The symbol's shapes as plain elements (a list, not a component, so Satori's SVG serializer sees them). */
export function ayaShapes(color = "currentColor") {
  return [
    <path key="stem" d={AYA.stem} stroke={color} strokeWidth="22" strokeLinecap="round" fill="none" />,
    <path key="fronds" d={AYA.fronds} stroke={color} strokeWidth="18" strokeLinecap="round" fill="none" />,
    ...AYA.tips.map(([cx, cy, rx, ry]) => <ellipse key={`${cx},${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} fill={color} />),
    <path key="loops" d={AYA.loops} fill={color} fillRule="evenodd" />,
  ];
}

// Aya fitted inside the ring: 29 units tall, centred
const K = 29 / 640;
const FIT = `translate(${(24 - 250 * K).toFixed(3)} ${(24 - 300 * K).toFixed(3)}) scale(${K.toFixed(5)})`;

/** Plain SVG (no hooks, no classes), so Satori can draw it in the share images too. Transparent: no background. */
export default function Mark({ size = 32, color = "currentColor", className, ticks = true }: { size?: number; color?: string; className?: string; ticks?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="24" cy="24" r="21.6" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="19.7" strokeWidth=".55" />
      {ticks && <path d={TICKS} strokeWidth=".45" />}
      <g transform={FIT}>{ayaShapes(color)}</g>
    </svg>
  );
}
