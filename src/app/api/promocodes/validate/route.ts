// app/api/promocodes/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Promotion code is required" },
        { status: 400 },
      );
    }

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Invalid promotion code" },
        { status: 404 },
      );
    }

    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { error: "This promotion code is not active" },
        { status: 400 },
      );
    }

    // Check date validity
    const now = new Date();
    if (promoCode.startDate > now) {
      return NextResponse.json(
        { error: "This promotion code is not valid yet" },
        { status: 400 },
      );
    }

    if (promoCode.endDate && promoCode.endDate < now) {
      return NextResponse.json(
        { error: "This promotion code has expired" },
        { status: 400 },
      );
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return NextResponse.json(
        { error: "This promotion code has reached its usage limit" },
        { status: 400 },
      );
    }

    // Check minimum amount if present
    if (
      promoCode.minimumAmount &&
      cartTotal < parseFloat(promoCode.minimumAmount.toString())
    ) {
      return NextResponse.json(
        {
          error: "Cart total does not meet the minimum amount for this code",
          minimumAmount: promoCode.minimumAmount,
        },
        { status: 400 },
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promoCode.discountType === "PERCENTAGE") {
      discountAmount =
        (cartTotal * parseFloat(promoCode.discountAmount.toString())) / 100;
    } else {
      discountAmount = parseFloat(promoCode.discountAmount.toString());
      // Ensure discount doesn't exceed cart total
      if (discountAmount > cartTotal) {
        discountAmount = cartTotal;
      }
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountAmount,
      originalAmount: promoCode.discountAmount,
      description: promoCode.description,
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Failed to validate promotion code" },
      { status: 500 },
    );
  }
}
