// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // Extract query parameters
    const categorySlug = url.searchParams.get("category");
    const searchQuery = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const sort = url.searchParams.get("sort") || "createdAt";
    const order = url.searchParams.get("order") || "desc";
    const featured = url.searchParams.get("featured") === "true";

    // Build where clause for filtering
    const whereClause: any = {
      isVisible: true,
    };

    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: searchQuery } },
        { description: { contains: searchQuery } },
      ];
    }

    if (categorySlug) {
      whereClause.categories = {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      };
    }

    if (featured) {
      whereClause.isFeatured = true;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: {
          where: { isDefault: true },
          take: 1,
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sort]: order,
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.product.count({
      where: whereClause,
    });

    // Format response data
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      image: product.images[0]?.url || null,
      categories: product.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.slug || !data.price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this slug already exists" },
        { status: 400 },
      );
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        sku: data.sku || null,
        inventory: data.inventory || 0,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        isVisible: data.isVisible !== undefined ? data.isVisible : true,
        isFeatured: data.isFeatured || false,
      },
    });

    // Add categories if provided
    if (
      data.categories &&
      Array.isArray(data.categories) &&
      data.categories.length > 0
    ) {
      const categoryConnections = data.categories.map((categoryId: string) => ({
        categoryId,
        productId: product.id,
      }));

      await prisma.productToCategory.createMany({
        data: categoryConnections,
      });
    }

    // Add images if provided
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      const imageData = data.images.map((image: any, index: number) => ({
        productId: product.id,
        url: image.url,
        alt: image.alt || product.name,
        isDefault: index === 0, // First image is default
        sortOrder: index,
      }));

      await prisma.productImage.createMany({
        data: imageData,
      });
    }

    // Add attributes if provided
    if (
      data.attributes &&
      Array.isArray(data.attributes) &&
      data.attributes.length > 0
    ) {
      const attributeData = data.attributes.map((attr: any) => ({
        productId: product.id,
        name: attr.name,
        value: attr.value,
      }));

      await prisma.productAttribute.createMany({
        data: attributeData,
      });
    }

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
