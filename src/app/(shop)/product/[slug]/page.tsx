// app/(shop)/product/[slug]/page.tsx
import { Metadata } from "next";
import prisma from "@/lib/db";
import ProductDetail from "@/components/product/ProductDetail";

// This will dynamically generate the metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  // Fetch product data
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      description: true,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: product.metaTitle || `${product.name} | Quantum E-Commerce`,
    description:
      product.metaDescription || product.description.substring(0, 160),
  };
}

// Generate static params for common products
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
    where: { isVisible: true },
    take: 50, // Limit to most popular products
  });

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Fetch initial product data
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
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
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 text-white bg-black rounded-md hover:bg-gray-800 transition duration-300"
          >
            Return to home
          </a>
        </div>
      </div>
    );
  }

  // Format data for frontend
  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    inventory: product.inventory,
    sku: product.sku || null,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt || product.name,
    })),
    categories: product.categories.map((pc) => ({
      id: pc.category.id,
      name: pc.category.name,
      slug: pc.category.slug,
    })),
  };

  return <ProductDetail product={productData} />;
}
