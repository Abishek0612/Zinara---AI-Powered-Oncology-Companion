import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getClientIp, generatePatientId } from "@/lib/utils";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain uppercase, lowercase, and a number"
        ),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validated = registerSchema.parse(body);

        // Check existing user
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(validated.password, 12);
        const ipAddress = getClientIp(req);
        const patientId = generatePatientId();

        const user = await prisma.user.create({
            data: {
                name: validated.name,
                email: validated.email,
                hashedPassword,
                ipAddress,
                patientId,
            },
            select: {
                id: true,
                patientId: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                message: "Account created successfully",
                user,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: (error as any).errors[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
