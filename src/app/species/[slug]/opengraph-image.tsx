import { ImageResponse } from "next/og";
import { CODEX, getEntry } from "@/lib/codex";
import { OG_SIZE, ogFonts, Seal } from "../../og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Specimen sheet from The Nature Library";

export function generateStaticParams() {
  return CODEX.map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEntry((await params).slug);
  const photo = e?.photos?.[0]?.medium ?? e?.photos?.[0]?.url;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ede7d7", color: "#1b1d16", fontFamily: "Fell", padding: 48, gap: 48 }}>
        <div style={{ display: "flex", width: 470, height: 534, background: "#f4efe2", padding: 14, boxShadow: "0 12px 30px -16px rgba(58,47,26,.5)" }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} width={442} height={506} style={{ objectFit: "cover", width: 442, height: 506 }} alt="" />
          ) : (
            <div style={{ display: "flex", flex: 1, background: "#d8ceb4" }} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingTop: 8, paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#45463a" }}>
            <Seal size={40} />
            {`The Nature Library · ${e?.nl ?? ""}`}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: (e?.common.length ?? 0) > 18 ? 78 : 98, lineHeight: 0.95 }}>{e?.common ?? "Specimen"}</div>
            <div style={{ fontSize: 40, fontStyle: "italic", color: "#2e4a32", marginTop: 14 }}>{e?.scientific ?? ""}</div>
          </div>
          <div style={{ fontSize: 26, color: "#45463a", lineHeight: 1.3 }}>{`${(e?.summary ?? "").slice(0, 150)}${(e?.summary?.length ?? 0) > 150 ? "…" : ""}`}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: ogFonts() }
  );
}
