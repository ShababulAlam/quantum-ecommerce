// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// Helper to get or create a cart
async function getOrCreateCart(
  userId: string | null,
  sessionId: string | null,
) {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId must be provided");
  }

  let cart;

  if (userId) {
    // Try to find user's cart
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      // Create new cart for user
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }
  } else if (sessionId) {
    // Try to find session cart
    cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!cart) {
      // Create new cart for session
      cart = await prisma.cart.create({
        data: { sessionId },
        include: { items: true },
      });
    }
  }

  return cart;
}

// Helper to merge guest cart to user cart
async function mergeGuestCartToUserCart(userId: string, sessionId: string) {
  // Get both carts
  const userCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  const sessionCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!sessionCart || sessionCart.items.length === 0) {
    return userCart || (await prisma.cart.create({ data: { userId } }));
  }

  if (!userCart) {
    // If no user cart exists, just update the session cart to belong to the user
    return await prisma.cart.update({
      where: { id: sessionCart.id },
      data: { userId, sessionId: null },
      include: { items: true },
    });
  }

  // Merge items from session cart to user cart
  for (const item of sessionCart.items) {
    // Check if item already exists in user cart
    const existingItem = userCart.items.find(
      (i) => i.productId === item.productId && i.variantId === item.variantId,
    );

    if (existingItem) {
      // Update quantity of existing item
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + item.quantity },
      });
    } else {
      // Move item to user cart
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { cartId: userCart.id },
      });
    }
  }

  // Delete the session cart
  await prisma.cart.delete({ where: { id: sessionCart.id } });

  // Return the updated user cart
  return await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Get sessionId from cookies
    const sessionId = req.cookies.get("sessionId")?.value || null;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "No user or session identified" },
        { status: 400 },
      );
    }

    // If both userId and sessionId exist, merge carts
    if (userId && sessionId) {
      const mergedCart = await mergeGuestCartToUserCart(userId, sessionId);

      // Prepare and return cart data
      const cartWithProducts = await prisma.cart.findUnique({
        where: { id: mergedCart!.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: {
                      isDefault: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      // Format cart data
      const formattedCart = {
        id: cartWithProducts!.id,
        items: cartWithProducts!.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: item.product.price,
            image: item.product.images[0]?.url || null,
          },
          variantId: item.variantId,
          subtotal: parseFloat(String(item.product.price)) * item.quantity,
        })),
        totalItems: cartWithProducts!.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
        subtotal: cartWithProducts!.items.reduce(
          (sum, item) =>
            sum + parseFloat(String(item.product.price)) * item.quantity,
          0,
        ),
      };

      return NextResponse.json(formattedCart);
    }

    // Get or create cart for either user or session
    const cart = await getOrCreateCart(userId, sessionId);

    // Prepare and return cart data
    const cartWithProducts = await prisma.cart.findUnique({
      where: { id: cart!.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: {
                    isDefault: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Format cart data
    const formattedCart = {
      id: cartWithProducts!.id,
      items: cartWithProducts!.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          image: item.product.images[0]?.url || null,
        },
        variantId: item.variantId,
        subtotal: parseFloat(String(item.product.price)) * item.quantity,
      })),
      totalItems: cartWithProducts!.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      ),
      subtotal: cartWithProducts!.items.reduce(
        (sum, item) =>
          sum + parseFloat(String(item.product.price)) * item.quantity,
        0,
      ),
    };

    return NextResponse.json(formattedCart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 },
    );
  }
}

// POST to add item to cart
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Get sessionId from cookies or generate new one
    let sessionId = req.cookies.get("sessionId")?.value;
    if (!userId && !sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);

      // Will need to set this cookie in the response
    }

    const data = await req.json();

    // Validate required fields
    if (!data.productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Verify product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.isVisible) {
      return NextResponse.json(
        { error: "Product is not available" },
        { status: 400 },
      );
    }

    // Check inventory if tracking is enabled
    if (
      product.inventory !== null &&
      product.inventory < (data.quantity || 1)
    ) {
      return NextResponse.json(
        { error: "Not enough inventory available" },
        { status: 400 },
      );
    }

    // If variant is specified, verify it exists
    if (data.variantId) {
      const variant = await prisma.productVariant.findFirst({
        where: {
          id: data.variantId,
          productId: data.productId,
        },
      });

      if (!variant) {
        return NextResponse.json(
          { error: "Variant not found" },
          { status: 404 },
        );
      }

      if (
        variant.inventory !== null &&
        variant.inventory < (data.quantity || 1)
      ) {
        return NextResponse.json(
          { error: "Not enough variant inventory available" },
          { status: 400 },
        );
      }
    }

    // Get or create cart
    const cart = await getOrCreateCart(userId, sessionId);

    // Check if product already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart!.id,
        productId: data.productId,
        variantId: data.variantId || null,
      },
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (data.quantity || 1) },
      });

      const response = NextResponse.json({
        message: "Item quantity updated in cart",
        item: updatedItem,
      });

      // Set session cookie if needed
      if (!userId && sessionId) {
        response.cookies.set("sessionId", sessionId, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });
      }

      return response;
    } else {
      // Add new item to cart
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart!.id,
          productId: data.productId,
          variantId: data.variantId || null,
          quantity: data.quantity || 1,
        },
      });

      const response = NextResponse.json(
        {
          message: "Item added to cart",
          item: newItem,
        },
        { status: 201 },
      );

      // Set session cookie if needed
      if (!userId && sessionId) {
        response.cookies.set("sessionId", sessionId, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });
      }

      return response;
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 },
    );
  }
}

// DELETE to clear the cart
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // Get sessionId from cookies
    const sessionId = req.cookies.get("sessionId")?.value || null;

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: "No user or session identified" },
        { status: 400 },
      );
    }

    // Find the cart
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      return NextResponse.json({
        message: "No cart found to clear",
      });
    }

    // Delete all items in the cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 },
    );
  }
}
