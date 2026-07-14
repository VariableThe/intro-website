import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const rawHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.hostname;
  const hostname = rawHost.split(",")[0].trim().split(":")[0].toLowerCase();

  let section: string | null = null;

  if (
    hostname === "blog.vrbl.win" ||
    hostname === "blog.intro.vrbl.win" ||
    hostname.startsWith("blog.")
  ) {
    section = "blog";
  } else if (
    hostname === "projects.intro.vrbl.win" ||
    hostname === "projects.vrbl.win" ||
    hostname.startsWith("projects.")
  ) {
    section = "projects";
  } else if (
    hostname === "about.intro.vrbl.win" ||
    hostname === "about.vrbl.win" ||
    hostname.startsWith("about.")
  ) {
    section = "about";
  } else if (
    hostname === "fun.intro.vrbl.win" ||
    hostname === "fun.vrbl.win" ||
    hostname.startsWith("fun.")
  ) {
    section = "fun";
  }

  if (section) {
    const pathname = url.pathname;

    // Do not rewrite Next.js internals, API routes, or files with extensions (.css, .png, .ico, etc.)
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // If already targeting /<section> or /<section>/..., proceed directly
    if (pathname === `/${section}` || pathname.startsWith(`/${section}/`)) {
      return NextResponse.next();
    }

    const rewriteUrl = request.nextUrl.clone();
    if (pathname === "/") {
      rewriteUrl.pathname = `/${section}`;
    } else {
      rewriteUrl.pathname = `/${section}${pathname}`;
    }
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
