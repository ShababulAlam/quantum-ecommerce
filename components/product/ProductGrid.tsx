// components/product/ProductGrid.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface ProductGridProps {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  categories: { id: string; name: string; slug: string }[];
}

interface PaginationData {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function ProductGrid({
  categorySlug,
  featured = false,
  limit = 12,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit,
    totalItems: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let url = `/api/products?limit=${limit}&page=${pagination.page}`;

        if (categorySlug) {
          url += `&category=${categorySlug}`;
        }

        if (featured) {
          url += "&featured=true";
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, featured, limit, pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      // Show success notification or update cart UI
      // This could be handled by a global state or context
    } catch (err) {
      console.error("Error adding to cart:", err);
      // Show error notification
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-64 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium text-gray-700">No products found</h3>
        <p className="text-gray-500 mt-2">
          {categorySlug
            ? "There are no products in this category yet."
            : "Please check back later for new arrivals."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <Link
              href={`/product/${product.slug}`}
              className="block relative h-64 overflow-hidden"
            >
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="bg-gray-100 h-full w-full flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}

              {product.compareAtPrice && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {Math.round(
                    (1 - product.price / product.compareAtPrice) * 100,
                  )}
                  % OFF
                </div>
              )}
            </Link>

            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                <Link href={`/product/${product.slug}`}>{product.name}</Link>
              </h3>

              <div className="flex items-center mb-3">
                {product.compareAtPrice ? (
                  <>
                    <span className="text-lg font-bold text-black mr-2">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-black">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product.id);
                  }}
                  className="flex-1 mr-2 flex items-center justify-center py-2 px-3 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </button>

                <button
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <nav className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 border border-gray-300 text-sm font-medium ${
                  pagination.page === i + 1
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } ${i === 0 ? "" : "-ml-px"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed -ml-px"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
