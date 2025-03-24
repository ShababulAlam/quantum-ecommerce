// app/api/admin/media/cleanup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { cleanupUnusedImages } from "@/lib/media";

export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run cleanup process
    const result = await cleanupUnusedImages();

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: ${result.removed} files removed, ${result.errors} errors`,
      result,
    });
  } catch (error: any) {
    console.error("Error during media cleanup:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run media cleanup" },
      { status: 500 },
    );
  }
}
