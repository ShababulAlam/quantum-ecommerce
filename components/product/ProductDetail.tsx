// components/product/ProductDetail.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Share2,
  Check,
} from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    inventory: number;
    sku: string | null;
    images: ProductImage[];
    categories: Category[];
  };
}

export default function ProductDetail({ product }: ProductProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.url || "",
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Calculate discount percentage if there's a compare-at price
  const discountPercentage = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= (product.inventory || 999)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      // Show success notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Could show an error notification here
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsAddingToCart(true);

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      // Navigate to cart page
      router.push("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Could show an error notification here
    } finally {
      setIsAddingToCart(false);
    }
  };

  // If no product data is available
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-lg text-gray-600">
          Product information unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Success notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center"
          >
            <Check className="mr-2 h-5 w-5" />
            <span>Added to cart successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-black">
                Home
              </Link>
              <span className="mx-2">/</span>
            </li>
            {product.categories[0] && (
              <li>
                <Link
                  href={`/category/${product.categories[0].slug}`}
                  className="hover:text-black"
                >
                  {product.categories[0].name}
                </Link>
                <span className="mx-2">/</span>
              </li>
            )}
            <li className="font-medium text-gray-800">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image.url)}
                  className={`relative aspect-square rounded overflow-hidden ${
                    selectedImage === image.url
                      ? "ring-2 ring-black"
                      : "ring-1 ring-gray-200"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover object-center"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">(24 reviews)</span>
              </div>

              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-bold text-gray-900 mr-3">
                  ${product.price.toFixed(2)}
                </span>

                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                    <span className="ml-3 px-2 py-1 text-xs font-medium text-white bg-red-500 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="prose prose-sm text-gray-700 mb-6">
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              {/* Product Metadata */}
              <div className="border-t border-b border-gray-200 py-4 space-y-3 mb-6">
                {product.sku && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Categories:</span>
                  <span className="font-medium">
                    {product.categories.map((cat) => cat.name).join(", ")}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Availability:</span>
                  <span className="font-medium">
                    {product.inventory > 0
                      ? product.inventory > 10
                        ? "In Stock"
                        : `Only ${product.inventory} left`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Quantity
                </label>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-l bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max={product.inventory || 999}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="p-2 w-16 text-center border-t border-b border-gray-300 focus:ring-black focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.inventory || 999)}
                    className="p-2 border border-gray-300 rounded-r bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.inventory === 0}
                  className="flex-1 bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
                >
                  {isAddingToCart ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || product.inventory === 0}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Buy Now
                </button>

                <button
                  type="button"
                  className="hidden sm:flex items-center justify-center p-3 text-gray-400 hover:text-red-500 border border-gray-300 rounded-md hover:bg-gray-50"
                  aria-label="Add to wishlist"
                >
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {/* Social Sharing */}
              <div className="mt-6 flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-4">
                  Share:
                </span>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-500">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (could be expanded with reviews, etc.) */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-black text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Description
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Reviews
              </button>
              <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Shipping & Returns
              </button>
            </nav>
          </div>

          <div className="py-10 prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </div>
      </div>
    </div>
  );
}
