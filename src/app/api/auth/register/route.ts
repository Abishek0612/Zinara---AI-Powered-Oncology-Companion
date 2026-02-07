
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                hashedPassword,
                role: "PATIENT",
                onboardingDone: false, // Explicitly false for new users
                patientId: `ZNR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, // Generate simple ID
            },
        });

        // Remove password from response
        const { hashedPassword: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("Registration error:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
