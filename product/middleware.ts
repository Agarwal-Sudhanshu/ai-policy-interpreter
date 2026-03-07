import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const INTERNAL_SECRET_HEADER = "x-internal-secret";

// Guest mode: only these paths require authentication (redirect to /login if no user)
const AUTH_REQUIRED_PAGE_PREFIXES = [
  "/organizations",
  "/products",
  "/upload-policy",
];
const AUTH_REQUIRED_API_PATHS = ["/api/upload-policy"];
const INTERNAL_API_PATHS = [
  "/api/process-policy",
  "/api/extract-rules",
  "/api/generate-policy-chunks",
];
const AUTH_PATHS = ["/login", "/signup"];
const INNGEST_PATH = "/api/inngest";

function isAuthRequiredPage(pathname: string): boolean {
  if (AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)))
    return false;
  if (pathname === "/policies/create" || pathname.startsWith("/policies/create/"))
    return true;
  return AUTH_REQUIRED_PAGE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isAuthRequiredApi(pathname: string): boolean {
  return AUTH_REQUIRED_API_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isInternalApi(pathname: string): boolean {
  return INTERNAL_API_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function hasValidInternalSecret(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;
  return request.headers.get(INTERNAL_SECRET_HEADER) === secret;
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  try {
  const pathname = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === INNGEST_PATH || pathname.startsWith(`${INNGEST_PATH}/`)) {
    return response;
  }

  // Inngest calls these with no user cookie; allow through so the pipeline can run.
  if (isInternalApi(pathname)) return response;

  if ((isAuthRequiredPage(pathname) || isAuthRequiredApi(pathname)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPath(pathname) && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
  } catch (err) {
    throw err;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
