// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to checkout" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const { shippingAddress, billingAddress, paymentMethod, promoCode } =
      await req.json();

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: "Shipping address and payment method are required" },
        { status: 400 },
      );
    }

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate order totals
    const subtotal = cart.items.reduce(
      (sum, item) =>
        sum + parseFloat(item.product.price.toString()) * item.quantity,
      0,
    );

    // Apply shipping rate (simplified for demo)
    const shippingRate = 10.0;

    // Calculate tax (simplified for demo - 10% tax rate)
    const taxRate = 0.1;
    const tax = subtotal * taxRate;

    // Handle promo code if provided
    let discount = 0;
    let promoCodeRecord = null;

    if (promoCode) {
      promoCodeRecord = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      });

      if (promoCodeRecord) {
        // Verify promo code validity
        const now = new Date();
        const isValid =
          promoCodeRecord.isActive &&
          promoCodeRecord.startDate <= now &&
          (!promoCodeRecord.endDate || promoCodeRecord.endDate >= now) &&
          (!promoCodeRecord.usageLimit ||
            promoCodeRecord.usageCount < promoCodeRecord.usageLimit) &&
          (!promoCodeRecord.minimumAmount ||
            subtotal >= parseFloat(promoCodeRecord.minimumAmount.toString()));

        if (isValid) {
          // Calculate discount
          if (promoCodeRecord.discountType === "PERCENTAGE") {
            discount =
              (subtotal *
                parseFloat(promoCodeRecord.discountAmount.toString())) /
              100;
          } else {
            discount = parseFloat(promoCodeRecord.discountAmount.toString());
            // Ensure discount doesn't exceed subtotal
            if (discount > subtotal) {
              discount = subtotal;
            }
          }

          // Increment usage count
          await prisma.promoCode.update({
            where: { id: promoCodeRecord.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    }

    // Calculate total
    const total = subtotal + tax + shippingRate - discount;

    // Format numbers to 2 decimal places
    const formattedSubtotal = parseFloat(subtotal.toFixed(2));
    const formattedTax = parseFloat(tax.toFixed(2));
    const formattedShipping = parseFloat(shippingRate.toFixed(2));
    const formattedDiscount = parseFloat(discount.toFixed(2));
    const formattedTotal = parseFloat(total.toFixed(2));

    // Create or get shipping address record
    let addressId;
    if (shippingAddress.id) {
      // Use existing address
      const address = await prisma.address.findFirst({
        where: {
          id: shippingAddress.id,
          userId,
        },
      });

      if (!address) {
        return NextResponse.json({ error: "Invalid address" }, { status: 400 });
      }

      addressId = address.id;
    } else {
      // Create new address
      const newAddress = await prisma.address.create({
        data: {
          userId,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          isDefault: shippingAddress.isDefault || false,
        },
      });

      addressId = newAddress.id;
    }

    // Generate order number
    const lastOrder = await prisma.order.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    let orderNumber = "ORD-1001";
    if (lastOrder) {
      const lastOrderNum = parseInt(lastOrder.number.split("-")[1]);
      orderNumber = `ORD-${lastOrderNum + 1}`;
    }

    // Process dummy payment (in a real app, you would integrate with a payment provider)
    const paymentId = `PAY-${Math.random().toString(36).substring(2, 15)}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        number: orderNumber,
        userId,
        addressId,
        status: "PENDING",
        total: formattedTotal,
        subtotal: formattedSubtotal,
        tax: formattedTax,
        shipping: formattedShipping,
        discount: formattedDiscount,
        promoCodeId: promoCodeRecord?.id || null,
        paymentMethod,
        paymentId,
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
            price: item.product.price,
            quantity: item.quantity,
            attributes: item.variantId
              ? JSON.stringify({ variantId: item.variantId })
              : null,
          })),
        },
      },
      include: {
        items: true,
        address: true,
      },
    });

    // Update product inventory
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          inventory: {
            decrement: item.quantity,
          },
        },
      });

      // If it's a variant, update variant inventory too
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Clear the user's cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.number,
        total: formattedTotal,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 },
    );
  }
}
