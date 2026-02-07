import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    callbacks: {
        authorized({ auth, request: nextUrl }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.nextUrl.pathname.startsWith("/dashboard");
            const isOnOnboarding = nextUrl.nextUrl.pathname.startsWith("/onboarding");

            if (isOnDashboard || isOnOnboarding) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        }
    },
    providers: [], // Providers configured in auth.ts to avoid Node.js/Edge issues
} satisfies NextAuthConfig;
