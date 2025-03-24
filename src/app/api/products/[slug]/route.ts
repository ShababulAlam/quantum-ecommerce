// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const { slug } = params;

    // Find the product
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
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
        attributes: true,
        variants: true,
        reviews: {
          where: { isVisible: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Calculate average rating
    let averageRating = 0;
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      averageRating = totalRating / product.reviews.length;
    }

    // Format response data
    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      sku: product.sku,
      inventory: product.inventory,
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt || product.name,
        isDefault: image.isDefault,
      })),
      categories: product.categories.map((pc) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
      attributes: product.attributes.map((attr) => ({
        id: attr.id,
        name: attr.name,
        value: attr.value,
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        inventory: variant.inventory,
        attributes: JSON.parse(variant.attributes),
      })),
      reviews: {
        items: product.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          createdAt: review.createdAt,
          user: {
            id: review.user.id,
            name: review.user.name,
            image: review.user.image,
          },
        })),
        averageRating,
        count: product.reviews.length,
      },
      seo: {
        metaTitle: product.metaTitle || product.name,
        metaDescription:
          product.metaDescription || product.description.substring(0, 160),
      },
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;
    const data = await req.json();

    // Find the product
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if new slug is provided and it's different from current slug
    if (data.slug && data.slug !== slug) {
      // Check if new slug is unique
      const existingProduct = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (existingProduct && existingProduct.id !== product.id) {
        return NextResponse.json(
          { error: "Product with this slug already exists" },
          { status: 400 },
        );
      }
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        slug: data.slug !== undefined ? data.slug : undefined,
        description:
          data.description !== undefined ? data.description : undefined,
        price: data.price !== undefined ? data.price : undefined,
        compareAtPrice:
          data.compareAtPrice !== undefined ? data.compareAtPrice : undefined,
        sku: data.sku !== undefined ? data.sku : undefined,
        inventory: data.inventory !== undefined ? data.inventory : undefined,
        metaTitle: data.metaTitle !== undefined ? data.metaTitle : undefined,
        metaDescription:
          data.metaDescription !== undefined ? data.metaDescription : undefined,
        isVisible: data.isVisible !== undefined ? data.isVisible : undefined,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : undefined,
      },
    });

    // Update categories if provided
    if (data.categories && Array.isArray(data.categories)) {
      // Delete existing category connections
      await prisma.productToCategory.deleteMany({
        where: { productId: product.id },
      });

      // Create new category connections
      if (data.categories.length > 0) {
        const categoryConnections = data.categories.map(
          (categoryId: string) => ({
            categoryId,
            productId: product.id,
          }),
        );

        await prisma.productToCategory.createMany({
          data: categoryConnections,
        });
      }
    }

    // Handle image updates if provided
    if (data.images && Array.isArray(data.images)) {
      // If images array is empty, delete all images
      if (data.images.length === 0) {
        await prisma.productImage.deleteMany({
          where: { productId: product.id },
        });
      } else {
        // Get existing images
        const existingImages = await prisma.productImage.findMany({
          where: { productId: product.id },
        });

        const existingImageIds = existingImages.map((img) => img.id);
        const newImageIds = data.images
          .filter((img: any) => img.id)
          .map((img: any) => img.id);

        // Delete images that are no longer present
        const imagesToDelete = existingImageIds.filter(
          (id) => !newImageIds.includes(id),
        );
        if (imagesToDelete.length > 0) {
          await prisma.productImage.deleteMany({
            where: {
              id: { in: imagesToDelete },
            },
          });
        }

        // Update or create images
        for (let i = 0; i < data.images.length; i++) {
          const image = data.images[i];
          if (image.id) {
            // Update existing image
            await prisma.productImage.update({
              where: { id: image.id },
              data: {
                url: image.url,
                alt: image.alt || updatedProduct.name,
                isDefault: i === 0, // First image is default
                sortOrder: i,
              },
            });
          } else {
            // Create new image
            await prisma.productImage.create({
              data: {
                productId: product.id,
                url: image.url,
                alt: image.alt || updatedProduct.name,
                isDefault: i === 0, // First image is default
                sortOrder: i,
              },
            });
          }
        }
      }
    }

    // Handle attributes updates if provided
    if (data.attributes && Array.isArray(data.attributes)) {
      // Delete existing attributes
      await prisma.productAttribute.deleteMany({
        where: { productId: product.id },
      });

      // Create new attributes
      if (data.attributes.length > 0) {
        const attributeData = data.attributes.map((attr: any) => ({
          productId: product.id,
          name: attr.name,
          value: attr.value,
        }));

        await prisma.productAttribute.createMany({
          data: attributeData,
        });
      }
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;

    // Find the product
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete the product (cascading deletes will handle related records)
    await prisma.product.delete({
      where: { id: product.id },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
