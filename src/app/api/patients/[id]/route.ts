import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

// GET specific patient
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Users can only access their own data
        if (session.user.id !== id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                patientId: true,
                name: true,
                email: true,
                ipAddress: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                onboardingDone: true,
                medicalProfile: true,
                onboardingResponses: {
                    orderBy: { stepNumber: "asc" },
                    include: { question: true },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json({ patient: user });
    } catch (error) {
        console.error("Get patient error:", error);
        return NextResponse.json(
            { error: "Failed to fetch patient" },
            { status: 500 }
        );
    }
}

// PATCH update patient
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (session.user.id !== id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // Handle password change
        if (body.currentPassword && body.newPassword) {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user?.hashedPassword) {
                return NextResponse.json(
                    { error: "Password change not available for social login accounts" },
                    { status: 400 }
                );
            }

            const isValid = await bcrypt.compare(
                body.currentPassword,
                user.hashedPassword
            );
            if (!isValid) {
                return NextResponse.json(
                    { error: "Current password is incorrect" },
                    { status: 400 }
                );
            }

            const passwordSchema = z
                .string()
                .min(8)
                .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/);
            const parsed = passwordSchema.safeParse(body.newPassword);
            if (!parsed.success) {
                return NextResponse.json(
                    { error: "Password must be 8+ chars with uppercase, lowercase, and a number" },
                    { status: 400 }
                );
            }

            const hashed = await bcrypt.hash(body.newPassword, 12);
            await prisma.user.update({
                where: { id },
                data: { hashedPassword: hashed },
            });

            return NextResponse.json({ message: "Password updated" });
        }

        // Handle profile update
        const updateData: Record<string, string> = {};
        if (body.name) updateData.name = body.name;

        const updated = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ patient: updated });
    } catch (error) {
        console.error("Update patient error:", error);
        return NextResponse.json(
            { error: "Failed to update patient" },
            { status: 500 }
        );
    }
}

// DELETE patient account
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        if (session.user.id !== id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Prisma cascade deletes handle related records
        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete patient error:", error);
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        );
    }
}
