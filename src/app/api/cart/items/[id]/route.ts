// app/api/cart/items/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Helper to verify cart ownership
async function verifyCartItemAccess(
  itemId: string,
  userId: string | null,
  sessionId: string | null,
) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!cartItem) {
    return false;
  }

  if (userId && cartItem.cart.userId === userId) {
    return true;
  }

  if (sessionId && cartItem.cart.sessionId === sessionId) {
    return true;
  }

  return false;
}

// PUT to update cart item quantity
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Get sessionId from cookies
    const sessionId = req.cookies.get("sessionId")?.value || null;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "No user or session identified" },
        { status: 401 },
      );
    }

    // Verify access to cart item
    const hasAccess = await verifyCartItemAccess(id, userId, sessionId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Cart item not found or access denied" },
        { status: 404 },
      );
    }

    const data = await req.json();

    // Validate quantity
    if (!data.quantity || data.quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 },
      );
    }

    // Get the cart item with product info
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });

    // Check inventory
    if (
      cartItem?.product.inventory !== null &&
      cartItem.product.inventory < data.quantity
    ) {
      return NextResponse.json(
        {
          error: "Not enough inventory available",
          availableQuantity: cartItem.product.inventory,
        },
        { status: 400 },
      );
    }

    // Update cart item quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity: data.quantity },
    });

    return NextResponse.json({
      message: "Cart item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 },
    );
  }
}

// DELETE to remove cart item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Get sessionId from cookies
    const sessionId = req.cookies.get("sessionId")?.value || null;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "No user or session identified" },
        { status: 401 },
      );
    }

    // Verify access to cart item
    const hasAccess = await verifyCartItemAccess(id, userId, sessionId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Cart item not found or access denied" },
        { status: 404 },
      );
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Cart item removed successfully",
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 },
    );
  }
}
