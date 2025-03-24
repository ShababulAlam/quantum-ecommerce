// app/(shop)/cart/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';

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

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validPromoCode, setValidPromoCode] = useState('');

  // Calculate shipping, tax, and total
  const shipping = cart && cart.items.length > 0 ? 10 : 0;
  const taxRate = 0.1; // 10%
  const tax = cart ? cart.subtotal * taxRate : 0;
  const total = cart ? cart.subtotal + shipping + tax - discount : 0;

  // Fetch cart data
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update quantity');
      }
      
      // Update cart data
      await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      // Could show an error toast here
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      
      // Update cart data
      await fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      // Could show an error toast here
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    try {
      setUpdating(true);
      
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      // Update cart data
      await fetchCart();
      // Reset promo code
      setPromoCode('');
      setDiscount(0);
      setValidPromoCode('');
    } catch (err) {
      console.error('Error clearing cart:', err);
      // Could show an error toast here
    } finally {
      setUpdating(false);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promotion code');
      return;
    }
    
    try {
      setUpdating(true);
      setPromoCodeError('');
      
      const response = await fetch('/api/promocodes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode,
          cartTotal: cart?.subtotal || 0,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid promotion code');
      }
      
      const data = await response.json();
      
      if (data.valid) {
        setDiscount(data.discountAmount);
        setValidPromoCode(data.code);
      } else {
        setPromoCodeError('Invalid promotion code');
      }
    } catch (err: any) {
      console.error('Error applying promo code:', err);
      setPromoCodeError(err.message || 'Failed to apply promotion code');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="border-t border-gray-200 py-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex py-6 border-b border-gray-200">
                  {/* Product Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>
                          <Link href={`/product/${item.product.slug}`}>{item.product.name}</Link>
                        </h3>
                        <p className="ml-4">${item.product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-1 items-end justify-between text-sm mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border rounded overflow-hidden">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          disabled={updating || item.quantity <= 1}
                          className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          disabled={updating}
                          className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={updating}
                        className="font-medium text-red-600 hover:text-red-500 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Actions */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Continue Shopping
              </button>
              
              <button
                type="button"
                onClick={clearCart}
                disabled={updating}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-16 rounded-lg bg-gray-50 px-6 py-6 lg:col-span-4 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flow-root">
              <div className="flex justify-between border-b border-gray-200 pb-3 text-gray-900">
                <p>Subtotal</p>
                <p className="font-medium">${cart.subtotal.toFixed(2)}</p>
              </div>
              
              {validPromoCode && (
                <div className="flex justify-between border-b border-gray-200 py-3 text-gray-900">
                  <p className="flex items-center">
                    Discount
                    <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      {validPromoCode}
                    </span>
                  </p>
                  <p className="font-medium text-green-600">-${discount.toFixed(2)}</p>
                </div>
              )}
              
              <div className="flex justify-between border-b border-gray-200 py-3 text-gray-900">
                <p>Shipping</p>
                <p className="font-medium">${shipping.toFixed(2)}</p>
              </div>
              
              <div className="flex justify-between border-b border-gray-200 py-3 text-gray-900">
                <p>Tax</p>
                <p className="font-medium">${tax.toFixed(2)}</p>
              </div>
              
              <div className="flex justify-between pt-3 text-gray-900">
                <p className="text-lg font-medium">Total</p>
                <p className="text-lg font-bold">${total.toFixed(2)}</p>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="mt-8">
              <div className="flow-root">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Promotion Code</h3>
                </div>
                
                <div className="mt-1">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="promoCode"
                      id="promoCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      placeholder="Enter code"
                      disabled={updating || !!validPromoCode}
                    />
                    
                    {validPromoCode ? (
                      <button
                        type="button"
                        onClick={() => {
                          setValidPromoCode('');
                          setDiscount(0);
                          setPromoCode('');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={applyPromoCode}
                        disabled={updating || !promoCode.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none disabled:opacity-50"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  
                  {promoCodeError && (
                    <p className="mt-2 text-sm text-red-600">{promoCodeError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="mt-8">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={updating || cart.items.length === 0}
                className="w-full bg-black border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-800 focus:outline-none disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} className="text-lg text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCart}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p