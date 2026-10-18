import { ImageResponse } from "next/og";
import { OG_SIZE, ogFonts, Seal } from "./og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "The Nature Library — a library of every living thing";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ede7d7", color: "#1b1d16", fontFamily: "Fell", padding: 44 }}>
        <div style={{ display: "flex", flex: 1, border: "1px solid #1b1d16", padding: 6 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, border: "2px solid #1b1d16", padding: "40px 52px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#45463a" }}>
            <Seal size={54} />A library of living things
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 116, lineHeight: 0.92 }}>The Nature Library</div>
            <div style={{ fontSize: 44, fontStyle: "italic", color: "#2e4a32", marginTop: 18 }}>Liber Naturae</div>
          </div>
          <div style={{ fontSize: 30, color: "#45463a", lineHeight: 1.3 }}>
            Every catalogued species on one turning planet · the old herbals · identify by photo · what will grow in your garden
          </div>
        </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: ogFonts() }
  );
}
