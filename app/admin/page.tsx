"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Eye,
  Tag,
  AlertCircle,
  MessageSquare,
  DollarSign,
  ShoppingCart,
  XCircle,
  Clock,
  UserPlus,
} from "lucide-react"
import AdminLayout from "@/components/AdminLayout"
import toast from "react-hot-toast"

interface RevenueData {
  month: string
  thisYear: number
  thisMonth: number
}

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalCategories: number
  totalMessages: number
  totalRevenue: number
  lastMonthRevenue: number // Added last month revenue field
  monthlyStats: {
    productsSold: number
    cancelledOrders: number
    pendingDeliveries: number
    newUsers: number
    newMessages: number
    revenue: number
  }
  recentOrders: Array<{
    _id: string
    orderNumber: string
    user: { name: string }
    totalAmount: number
    status: string
    createdAt: string
  }>
  revenueData: RevenueData[] // Added real revenue data from API
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "admin") {
      toast.error("Admin access required")
      router.push("/")
      return
    }
    fetchDashboardStats()
  }, [user, router])

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    try {
      console.log("Fetching dashboard stats...")
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      console.log("Dashboard response:", data)

      if (data.success) {
        setStats({
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalUsers: data.totalUsers || 0,
          totalCategories: data.totalCategories || 0,
          totalMessages: data.totalMessages || 0,
          totalRevenue: data.totalRevenue || 0,
          lastMonthRevenue: data.lastMonthRevenue || 0, // Added last month revenue from API
          monthlyStats: data.monthlyStats || {
            productsSold: 0,
            cancelledOrders: 0,
            pendingDeliveries: 0,
            newUsers: 0,
            newMessages: 0,
            revenue: 0,
          },
          recentOrders: data.recentOrders || [],
          revenueData: data.revenueData || [], // Now using real revenue data from API
        })
      } else {
        console.error("Failed to fetch dashboard stats:", data.error)
        toast.error(data.error || "Failed to load dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" })
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Active products in catalog
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalCategories || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Product categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Total orders placed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Statistics - {currentMonth}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? "..." : stats?.monthlyStats.productsSold || 0}
                </div>
                <p className="text-xs text-muted-foreground">Items sold this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders Cancelled</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? "..." : stats?.monthlyStats.cancelledOrders || 0}
                </div>
                <p className="text-xs text-muted-foreground">Cancelled orders this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {isLoading ? "..." : stats?.monthlyStats.pendingDeliveries || 0}
                </div>
                <p className="text-xs text-muted-foreground">Orders awaiting delivery</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <UserPlus className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? "..." : stats?.monthlyStats.newUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">New registrations this month</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue and Messages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                ${isLoading ? "..." : (stats?.totalRevenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mb-4">All-time revenue from orders</p>

              {/* Revenue Chart */}
              <div className="h-[200px] w-full">
                <ChartContainer
                  config={{
                    thisYear: {
                      label: "This Year",
                      color: "hsl(142, 76%, 36%)",
                    },
                    thisMonth: {
                      label: "This Month",
                      color: "hsl(142, 76%, 56%)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.revenueData || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 10 }} />
                      <YAxis className="text-xs" tick={{ fontSize: 10 }} tickFormatter={(value) => `$${value}`} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value, name) => [`$${value}`, name]}
                      />
                      <Line
                        type="monotone"
                        dataKey="thisYear"
                        stroke="var(--color-thisYear)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="This Year"
                      />
                      <Line
                        type="monotone"
                        dataKey="thisMonth"
                        stroke="var(--color-thisMonth)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="This Month"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span className="text-xs text-muted-foreground">This Year</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-xs text-muted-foreground">This Month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Month Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${isLoading ? "..." : (stats?.lastMonthRevenue || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Revenue from {lastMonth}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{isLoading ? "..." : stats?.totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground">Total contact form submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4">
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                    <div className="bg-gray-200 h-4 w-32 rounded"></div>
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.user?.name || "Unknown User"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold">${order.totalAmount}</span>
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : order.status === "shipped"
                                ? "secondary"
                                : order.status === "processing"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => router.push(`/admin/orders`)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent orders</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
