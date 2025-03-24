// src/app/(shop)/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, Loader, CheckCircle, AlertCircle } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
  };
  subtotal: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [validPromo, setValidPromo] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  // Calculate order totals
  const subtotal = cart?.subtotal || 0;
  const shipping = subtotal > 0 ? 10 : 0;
  const tax = subtotal * 0.1; // 10% tax rate
  const total = subtotal + shipping + tax - discount;

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/cart");

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();

        if (data.items.length === 0) {
          // Redirect to cart if empty
          router.push("/cart");
          return;
        }

        setCart(data);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to load your cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format card number with spaces
    if (name === "number") {
      const formatted = value
        .replace(/\s/g, "")
        .substring(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();

      setCardInfo((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    // Format expiry date
    if (name === "expiry") {
      const cleaned = value.replace(/\D/g, "");
      let formatted = cleaned;

      if (cleaned.length > 2) {
        formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
      }

      setCardInfo((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    // Format CVC
    if (name === "cvc") {
      const formatted = value.replace(/\D/g, "").substring(0, 3);
      setCardInfo((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    setCardInfo((prev) => ({ ...prev, [name]: value }));
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch("/api/promocodes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode,
          cartTotal: subtotal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid promotion code");
      }

      const data = await response.json();

      if (data.valid) {
        setDiscount(data.discountAmount);
        setValidPromo(data.code);
      }
    } catch (err: any) {
      console.error("Error applying promo code:", err);
      setError(err.message);

      // Clear error after 3 seconds
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode("");
    setDiscount(0);
    setValidPromo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.postalCode
    ) {
      setError("Please fill in all shipping address fields");
      return;
    }

    if (paymentMethod === "credit_card") {
      if (
        !cardInfo.number ||
        !cardInfo.name ||
        !cardInfo.expiry ||
        !cardInfo.cvc
      ) {
        setError("Please fill in all payment details");
        return;
      }
    }

    try {
      setProcessing(true);
      setError("");

      // In a real app, we'd validate the card info here
      // This is a simplified dummy checkout

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress: address,
          paymentMethod,
          promoCode: validPromo,
          // We'd include actual payment details in a real app
          // but for this example, we're just simulating payment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Checkout failed");
      }

      const data = await response.json();

      // Redirect to success page
      router.push(`/checkout/success?orderId=${data.order.id}`);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-black animate-spin mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Main content */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit}>
              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Shipping Address
                </h2>

                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <label
                      htmlFor="street"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700"
                      >
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700"
                      >
                        State / Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={address.postalCode}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Country
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={address.country}
                        onChange={handleAddressChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="credit_card"
                      name="paymentMethod"
                      type="radio"
                      value="credit_card"
                      checked={paymentMethod === "credit_card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label
                      htmlFor="credit_card"
                      className="ml-3 flex items-center text-sm font-medium text-gray-700"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Credit Card
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="paypal"
                      name="paymentMethod"
                      type="radio"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label
                      htmlFor="paypal"
                      className="ml-3 flex items-center text-sm font-medium text-gray-700"
                    >
                      <span className="text-blue-600 font-bold">Pay</span>
                      <span className="text-blue-800 font-bold">Pal</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === "credit_card" && (
                  <div className="mt-6 grid grid-cols-1 gap-y-4">
                    <div>
                      <label
                        htmlFor="card_number"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Card Number
                      </label>
                      <input
                        type="text"
                        id="card_number"
                        name="number"
                        value={cardInfo.number}
                        onChange={handleCardChange}
                        placeholder="1234 5678 9012 3456"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="card_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Name on Card
                      </label>
                      <input
                        type="text"
                        id="card_name"
                        name="name"
                        value={cardInfo.name}
                        onChange={handleCardChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="card_expiry"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          id="card_expiry"
                          name="expiry"
                          value={cardInfo.expiry}
                          onChange={handleCardChange}
                          placeholder="MM/YY"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="card_cvc"
                          className="block text-sm font-medium text-gray-700"
                        >
                          CVC
                        </label>
                        <input
                          type="text"
                          id="card_cvc"
                          name="cvc"
                          value={cardInfo.cvc}
                          onChange={handleCardChange}
                          placeholder="123"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      You will be redirected to PayPal to complete your payment
                      after reviewing your order.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit button - only visible on mobile */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${total.toFixed(2)}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-20">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {cart?.items.map((item) => (
                    <li key={item.id} className="py-6 flex">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              No image
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link href={`/product/${item.product.slug}`}>
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="ml-4">
                              ${item.product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-gray-500">Qty {item.quantity}</p>
                          <p className="font-medium">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Promo code */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 font-medium">
                    Promotion Code
                  </div>
                </div>

                {validPromo ? (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-700 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      {validPromo}
                    </span>
                    <button
                      type="button"
                      onClick={removePromoCode}
                      className="text-sm font-medium text-black hover:text-gray-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex space-x-2">
                    <input
                      type="text"
                      id="promoCode"
                      name="promoCode"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter code"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-black focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      disabled={processing || !promoCode.trim()}
                      className="bg-gray-100 text-gray-700 py-2 px-4 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <p>Subtotal</p>
                  <p className="font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </p>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <p>Discount</p>
                    <p className="font-medium text-green-600">
                      -${discount.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <p>Shipping</p>
                  <p className="font-medium text-gray-900">
                    ${shipping.toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <p>Tax</p>
                  <p className="font-medium text-gray-900">${tax.toFixed(2)}</p>
                </div>

                <div className="flex justify-between text-base font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
                  <p>Total</p>
                  <p>${total.toFixed(2)}</p>
                </div>
              </div>

              {/* Submit button - only visible on desktop */}
              <div className="mt-6 hidden lg:block">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={processing}
                  className="w-full bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${total.toFixed(2)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
