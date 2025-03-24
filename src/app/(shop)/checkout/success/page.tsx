// app/(shop)/checkout/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

interface OrderSummary {
  id: string;
  number: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order information not found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError("Unable to load order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-14 w-14 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Order information not found"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 text-white bg-black rounded-md hover:bg-gray-800 transition duration-300"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Thank you for your order!
            </h1>

            <p className="text-lg text-gray-600 mb-6">
              Your order has been placed successfully.
            </p>

            <div className="bg-gray-50 p-6 rounded-md mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="flex justify-between border-b border-gray-200 pb-2 mb-2">
                <span>Order Number:</span>
                <span className="font-medium">{order.number}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2 mb-2">
                <span>Date:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2 mb-2">
                <span>Status:</span>
                <span className="font-medium capitalize">
                  {order.status.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/user/orders"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none transition duration-300"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                View Order
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition duration-300"
              >
                Continue Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
