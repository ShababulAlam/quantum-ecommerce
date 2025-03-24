// components/product/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    image: string | null;
  };
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate discount percentage if there's a compare-at price
  const discountPercentage = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  // Staggered animation for cards when they appear
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1, // Stagger effect
      },
    },
  };

  // Animation for quick action buttons
  const actionButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="bg-white rounded-lg shadow-md overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block relative">
        <div className="relative h-60 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="bg-gray-100 h-full w-full flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          {/* Discount badge */}
          {product.compareAtPrice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10"
            >
              {discountPercentage}% OFF
            </motion.div>
          )}

          {/* Quick action buttons - only show on hover */}
          <motion.div
            initial="hidden"
            animate={isHovered ? "visible" : "hidden"}
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 },
            }}
            className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center space-x-2"
          >
            <motion.button
              variants={actionButtonVariants}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              onClick={addToCart}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
            </motion.button>

            <motion.button
              variants={actionButtonVariants}
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart className="h-5 w-5 text-gray-700" />
            </motion.button>

            <Link href={`/product/${product.slug}`}>
              <motion.span
                variants={actionButtonVariants}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors block"
                aria-label="Quick view"
              >
                <Eye className="h-5 w-5 text-gray-700" />
              </motion.span>
            </Link>
          </motion.div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-1 truncate group-hover:text-black transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center">
            {product.compareAtPrice ? (
              <>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-lg font-bold text-black mr-2"
                >
                  ${product.price.toFixed(2)}
                </motion.span>
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
        </div>
      </Link>
    </motion.div>
  );
}
