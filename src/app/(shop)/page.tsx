// app/(shop)/page.tsx
import Image from "next/image";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Hero background"
            fill
            className="object-cover object-center opacity-60"
            priority
          />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to Quantum E-Commerce
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 animate-slide-up">
              Discover the future of online shopping with our sleek, intuitive
              platform offering seamless transitions and effortless checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/category/electronics"
                className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Shop Electronics
              </Link>
              <Link
                href="/category/clothing"
                className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors"
              >
                Explore Fashion
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">
            Featured Products
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Discover our handpicked selection of premium products
          </p>

          <ProductGrid featured={true} limit={4} />

          <div className="mt-12 text-center">
            <Link
              href="/category/all"
              className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Browse our collection by category
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/category/electronics" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/images/category-electronics.jpg"
                  alt="Electronics"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-6">
                  <h3 className="text-white text-2xl font-bold">Electronics</h3>
                </div>
              </div>
            </Link>

            <Link href="/category/clothing" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/images/category-clothing.jpg"
                  alt="Clothing"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-6">
                  <h3 className="text-white text-2xl font-bold">Clothing</h3>
                </div>
              </div>
            </Link>

            <Link href="/category/home-kitchen" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/images/category-home.jpg"
                  alt="Home & Kitchen"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-6">
                  <h3 className="text-white text-2xl font-bold">
                    Home & Kitchen
                  </h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Hear from our satisfied customers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The checkout process was remarkably smooth. I love how
                seamlessly everything flows from browsing to payment. Will
                definitely shop again!"
              </p>
              <p className="font-medium">- Sarah J.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "The product animations make browsing fun! I appreciate the
                attention to detail and the high-quality products. Quantum is
                now my go-to store."
              </p>
              <p className="font-medium">- Michael T.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {"★★★★☆".split("").map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "Fast shipping and great customer service. The website is easy
                to navigate and I found exactly what I needed without any
                hassle."
              </p>
              <p className="font-medium">- Emily R.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold mb-2">Join Our Newsletter</h2>
          <p className="text-gray-300 mb-8">
            Stay updated with our latest products and exclusive offers
          </p>

          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md text-black"
              required
            />
            <button
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-gray-400 text-sm mt-4">
            By subscribing, you agree to our Privacy Policy and Terms of
            Service.
          </p>
        </div>
      </section>
    </main>
  );
}
