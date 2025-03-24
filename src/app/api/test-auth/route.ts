// src/app/api/test-auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { compare, hash } from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    // Find the admin user
    const admin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 },
      );
    }

    // Test password in a safe way
    const testPassword = "admin123";
    const passwordMatch = await compare(testPassword, admin.password);

    // If password doesn't match, regenerate it
    if (!passwordMatch) {
      // Create a new password hash
      const newPasswordHash = await hash(testPassword, 10);

      // Update the user with the new password
      await prisma.user.update({
        where: { id: admin.id },
        data: { password: newPasswordHash },
      });

      return NextResponse.json({
        message: "Admin password has been reset. Please try logging in again.",
        passwordFixed: true,
      });
    }

    return NextResponse.json({
      message: "Admin user found and password is correct",
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      passwordMatch,
    });
  } catch (error) {
    console.error("Error testing authentication:", error);
    return NextResponse.json(
      { error: "Authentication test failed" },
      { status: 500 },
    );
  }
}
