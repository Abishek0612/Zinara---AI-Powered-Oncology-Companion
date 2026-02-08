import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import type { NextAuthConfig } from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: {
                params: {
                    scope: "email,public_profile",
                },
            },
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.hashedPassword) {
                    throw new Error("Invalid credentials");
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.hashedPassword
                );

                if (!isValid) {
                    throw new Error("Invalid credentials");
                }

                return {

                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    onboardingDone: user.onboardingDone,
                    role: user.role,
                    patientId: user.patientId,
                };
            },

        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.userId = user.id;
                const u = user as any;
                if (typeof u.onboardingDone === 'boolean') {
                    token.onboardingDone = u.onboardingDone;
                }
                if (u.patientId) token.patientId = u.patientId;
                if (u.role) token.role = u.role;
            }

            // Handle updates
            if (trigger === "update" && session) {
                if (typeof session.onboardingDone === 'boolean') {
                    token.onboardingDone = session.onboardingDone;
                }
            }

            const email = user?.email || token.email;
            if (email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: email },
                        select: {
                            id: true,
                            patientId: true,
                            onboardingDone: true,
                            role: true,
                        },
                    });
                    if (dbUser) {
                        token.userId = dbUser.id;
                        token.patientId = dbUser.patientId;
                        token.onboardingDone = dbUser.onboardingDone;
                        token.role = dbUser.role;
                    }
                } catch (error) {
                    console.error("Error refreshing token from DB:", error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.userId as string || token.sub as string;
                session.user.patientId = token.patientId as string;
                session.user.onboardingDone = token.onboardingDone as boolean;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    events: {
        async signIn({ user }) {
            if (user.id) {
                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            ipAddress: "captured-at-middleware",
                        },
                    });
                } catch (e) {
                    console.error("Failed to update IP on sign-in:", e);
                }
            }
        },
        async createUser({ user }) {
            // Generate patient ID for OAuth users
            if (user.id) {
                const prefix = "ZNR";
                const timestamp = Date.now().toString(36).toUpperCase();
                const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                const patientId = `${prefix}-${timestamp}-${random}`;
                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { patientId },
                    });
                } catch (e) {
                    console.error("Failed to set patientId:", e);
                }
            }
        },
    },
});