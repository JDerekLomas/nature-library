import type { NextConfig } from "next";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// a fingerprint of the identifier's label tables, so a deploy that changes them can never pair new labels with cached old embeddings
function identifyVersion() {
  const h = crypto.createHash("sha1");
  const dir = path.join(process.cwd(), "public/identify");
  const walk = (d: string) => {
    for (const f of fs.readdirSync(d).sort()) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else h.update(f).update(fs.readFileSync(p));
    }
  };
  try {
    walk(dir);
  } catch {}
  return h.digest("hex").slice(0, 10);
}

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_IDENTIFY_VERSION: identifyVersion() },
  async headers() {
    return [
      {
        // species embeddings and labels for the in-browser identifier (fetched with ?v=<fingerprint>, so safe to cache long)
        source: "/identify/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
