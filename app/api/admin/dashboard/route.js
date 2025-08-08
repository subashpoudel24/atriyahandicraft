import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"
import Order from "@/lib/models/Order"
import User from "@/lib/models/User"
import Category from "@/lib/models/Category"
import Contact from "@/lib/models/Contact"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("GET /api/admin/dashboard - Starting...")
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 },
      )
    }

    console.log("Fetching dashboard statistics...")

    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get basic statistics
    const [totalProducts, totalOrders, totalUsers, totalCategories, totalMessages, recentOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Category.countDocuments(),
      Contact.countDocuments(),
      Order.find()
        .populate("user", "name email")
        .populate("items.product", "name images")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const totalRevenue = revenueResult[0]?.total || 0

    // Monthly statistics
    const [
      monthlyProductsSoldResult,
      monthlyCancelledOrders,
      pendingDeliveries,
      monthlyNewUsers,
      monthlyNewMessages,
      monthlyRevenueResult,
    ] = await Promise.all([
      // Total products sold this month
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $ne: "cancelled" },
          },
        },
        { $unwind: "$items" },
        { $group: { _id: null, totalSold: { $sum: "$items.quantity" } } },
      ]),

      // Total orders cancelled this month
      Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        status: "cancelled",
      }),

      // Pending deliveries
      Order.countDocuments({
        status: { $in: ["pending", "confirmed", "processing", "shipped"] },
      }),

      // New users this month
      User.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),

      // New messages this month
      Contact.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),

      // Monthly revenue
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            status: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ])

    const monthlyProductsSold = monthlyProductsSoldResult[0]?.totalSold || 0
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0

    console.log("Dashboard stats:", {
      totalProducts,
      totalOrders,
      totalUsers,
      totalCategories,
      totalMessages,
      totalRevenue,
      monthlyProductsSold,
      monthlyCancelledOrders,
      pendingDeliveries,
      monthlyNewUsers,
      monthlyNewMessages,
      monthlyRevenue,
      recentOrdersCount: recentOrders.length,
    })

    return NextResponse.json({
      success: true,
      totalProducts,
      totalOrders,
      totalUsers,
      totalCategories,
      totalMessages,
      totalRevenue,
      monthlyStats: {
        productsSold: monthlyProductsSold,
        cancelledOrders: monthlyCancelledOrders,
        pendingDeliveries: pendingDeliveries,
        newUsers: monthlyNewUsers,
        newMessages: monthlyNewMessages,
        revenue: monthlyRevenue,
      },
      recentOrders,
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
      },
      { status: 500 },
    )
  }
}
