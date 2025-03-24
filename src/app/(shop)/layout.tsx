// app/(shop)/layout.tsx
import Link from "next/link";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import "../globals.css";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">
              Quantum
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-800 hover:text-black">
                Home
              </Link>
              <Link
                href="/category/electronics"
                className="text-gray-800 hover:text-black"
              >
                Electronics
              </Link>
              <Link
                href="/category/clothing"
                className="text-gray-800 hover:text-black"
              >
                Clothing
              </Link>
              <Link
                href="/category/home-kitchen"
                className="text-gray-800 hover:text-black"
              >
                Home & Kitchen
              </Link>
            </nav>

            {/* Search, Cart, Account */}
            <div className="flex items-center space-x-4">
              <Link
                href="/search"
                className="text-gray-700 hover:text-black p-2"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                href="/cart"
                className="text-gray-700 hover:text-black p-2 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-black text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  0
                </span>
              </Link>

              <Link
                href={session ? "/user/account" : "/user/login"}
                className="text-gray-700 hover:text-black p-2"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Mobile menu button */}
              <button className="md:hidden text-gray-700 hover:text-black p-2">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Quantum</h3>
              <p className="text-gray-400">
                Your one-stop destination for premium products with a seamless
                shopping experience.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/category/electronics"
                    className="text-gray-400 hover:text-white"
                  >
                    Electronics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/clothing"
                    className="text-gray-400 hover:text-white"
                  >
                    Clothing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/home-kitchen"
                    className="text-gray-400 hover:text-white"
                  >
                    Home & Kitchen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/all"
                    className="text-gray-400 hover:text-white"
                  >
                    All Products
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/user/login"
                    className="text-gray-400 hover:text-white"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/user/register"
                    className="text-gray-400 hover:text-white"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/user/orders"
                    className="text-gray-400 hover:text-white"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    href="/user/wishlist"
                    className="text-gray-400 hover:text-white"
                  >
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-4">Information</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-gray-400 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Quantum E-Commerce. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
