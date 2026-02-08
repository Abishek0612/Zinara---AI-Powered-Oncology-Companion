import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const onboardingPaths = ["/question"];

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const session = req.auth as any;
    const isLoggedIn = !!session;
    const onboardingDone = session?.user?.onboardingDone;

    const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||

        pathname.startsWith("/register") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/health") ||
        (pathname === "/api/patients" && req.method === "POST");

    if (isPublic) {
        // Redirect logged-in users away from login/register
        if (isLoggedIn && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
            if (onboardingDone === false) {
                return NextResponse.redirect(new URL("/question/1", req.url));
            }
            return NextResponse.redirect(new URL("/treatment-plans", req.url));
        }
        return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!isLoggedIn) {
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(
            new URL(`/login?callbackUrl=${callbackUrl}`, req.url)
        );
    }


    // Redirect to onboarding if not completed
    if (
        onboardingDone === false &&
        !onboardingPaths.some((path) => pathname.startsWith(path)) &&
        !pathname.startsWith("/api")
    ) {
        return NextResponse.redirect(new URL("/question/1", req.url));
    }

    // Redirect to dashboard if onboarding is already completed but trying to access onboarding pages
    if (
        onboardingDone === true &&
        onboardingPaths.some((path) => pathname.startsWith(path))
    ) {
        return NextResponse.redirect(new URL("/treatment-plans", req.url));
    }



    // Track IP on API calls
    const response = NextResponse.next();
    const headers = req.headers;
    const ip =
        headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headers.get("x-real-ip") ||
        "unknown";
    response.headers.set("x-client-ip", ip);

    return response;
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};