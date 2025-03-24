// app/(admin)/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  BarChart3,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Calendar,
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: {
    id: string;
    number: string;
    status: string;
    total: number;
    createdAt: string;
    customer: {
      name: string;
    };
  }[];
  popularProducts: {
    id: string;
    name: string;
    price: number;
    totalSold: number;
  }[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session.user.role !== "ADMIN") {
      router.push("/"); // Redirect non-admin users
    } else if (status === "authenticated") {
      // Fetch dashboard data
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // In a real app, this would fetch from your API
      // For this demo, we'll use mock data
      const mockData: DashboardStats = {
        totalOrders: 156,
        totalSales: 12850.75,
        totalCustomers: 83,
        totalProducts: 48,
        recentOrders: [
          {
            id: "1",
            number: "ORD-1001",
            status: "DELIVERED",
            total: 128.5,
            createdAt: "2025-03-15T10:30:00Z",
            customer: { name: "John Doe" },
          },
          {
            id: "2",
            number: "ORD-1002",
            status: "PROCESSING",
            total: 256.75,
            createdAt: "2025-03-14T14:20:00Z",
            customer: { name: "Jane Smith" },
          },
          {
            id: "3",
            number: "ORD-1003",
            status: "SHIPPED",
            total: 89.99,
            createdAt: "2025-03-13T09:15:00Z",
            customer: { name: "Michael Johnson" },
          },
          {
            id: "4",
            number: "ORD-1004",
            status: "PENDING",
            total: 176.25,
            createdAt: "2025-03-12T16:45:00Z",
            customer: { name: "Sarah Williams" },
          },
          {
            id: "5",
            number: "ORD-1005",
            status: "DELIVERED",
            total: 345.0,
            createdAt: "2025-03-11T11:10:00Z",
            customer: { name: "Robert Brown" },
          },
        ],
        popularProducts: [
          { id: "1", name: "Quantum Smartwatch", price: 199.99, totalSold: 28 },
          {
            id: "2",
            name: "Nebula Wireless Earbuds",
            price: 79.99,
            totalSold: 24,
          },
          {
            id: "3",
            name: "Orbit Fitness Tracker",
            price: 89.99,
            totalSold: 19,
          },
          { id: "4", name: "Galaxy Phone Case", price: 24.99, totalSold: 16 },
          {
            id: "5",
            name: "Stellar Portable Charger",
            price: 49.99,
            totalSold: 14,
          },
        ],
      };

      setStats(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-gray-900 animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <span className="text-xl font-bold">Quantum Admin</span>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1 bg-white">
                <Link
                  href="/admin/dashboard"
                  className="bg-gray-100 text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <LayoutDashboard className="text-gray-500 mr-3 h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/products"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Package className="text-gray-500 mr-3 h-5 w-5" />
                  Products
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <ShoppingCart className="text-gray-500 mr-3 h-5 w-5" />
                  Orders
                </Link>
                <Link
                  href="/admin/customers"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Users className="text-gray-500 mr-3 h-5 w-5" />
                  Customers
                </Link>
                <Link
                  href="/admin/categories"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Tag className="text-gray-500 mr-3 h-5 w-5" />
                  Categories
                </Link>
                <Link
                  href="/admin/promotions"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Tag className="text-gray-500 mr-3 h-5 w-5" />
                  Promotions
                </Link>
                <Link
                  href="/admin/media"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Tag className="text-gray-500 mr-3 h-5 w-5" />
                  Media
                </Link>
                <Link
                  href="/admin/settings"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <Settings className="text-gray-500 mr-3 h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Top navigation */}
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex">
                  <h1 className="text-xl font-semibold">Dashboard</h1>
                </div>
                <div className="ml-4 flex items-center md:ml-6">
                  <span className="text-sm text-gray-600">
                    Welcome, {session?.user?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 relative overflow-y-auto py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Orders
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats?.totalOrders}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Sales
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              ${stats?.totalSales.toFixed(2)}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Customers
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats?.totalCustomers}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Products
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">
                              {stats?.totalProducts}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Orders
                  </h2>
                  <Link
                    href="/admin/orders"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    {stats?.recentOrders.map((order) => (
                      <li key={order.id}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="block hover:bg-gray-50"
                        >
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <ShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                                <p className="text-sm font-medium text-indigo-600 truncate">
                                  {order.number}
                                </p>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${
                                    order.status === "DELIVERED"
                                      ? "bg-green-100 text-green-800"
                                      : order.status === "PROCESSING"
                                      ? "bg-blue-100 text-blue-800"
                                      : order.status === "SHIPPED"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {order.status.toLowerCase()}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  {order.customer.name}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                <p>
                                  {new Date(
                                    order.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                                <p className="ml-4 font-medium text-gray-900">
                                  ${order.total.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Popular Products */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    Popular Products
                  </h2>
                  <Link
                    href="/admin/products"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    {stats?.popularProducts.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="block hover:bg-gray-50"
                        >
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="text-sm text-gray-700">
                                  ${product.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <TrendingUp className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" />
                                  {product.totalSold} sold
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
