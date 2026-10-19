import { NextResponse, type NextRequest } from "next/server";

// English pages keep their original, unprefixed URLs: /species/apis-mellifera is served from /en/species/apis-mellifera.
// Spanish pages live at /es/… . Anything already prefixed passes through.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (/^\/(en|es)(\/|$)/.test(pathname)) {
    // canonical English URLs have no prefix
    if (pathname === "/en" || pathname.startsWith("/en/")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(/^\/en/, "") || "/";
      return NextResponse.redirect(url, 308);
    }
    return;
  }
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // skip Next internals, API routes and any file with an extension (models, embeddings, icons, sitemap.xml, robots.txt)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
