import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {

        authorized({ auth, request: nextUrl }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.nextUrl.pathname.startsWith("/dashboard");
            const isOnOnboarding = nextUrl.nextUrl.pathname.startsWith("/onboarding");

            if (isOnDashboard || isOnOnboarding) {
                if (isLoggedIn) return true;
                return false;
            }
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token && session.user) {
                session.user.onboardingDone = token.onboardingDone as boolean;
                session.user.role = token.role as string;
                session.user.patientId = token.patientId as string;
            }
            return session;
        },

        async jwt({ token }) {
            return token;
        }
    },
    providers: [],
} satisfies NextAuthConfig;
