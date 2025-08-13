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

    // Get last month date range
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    // Get yearly revenue data for chart (12 months of current year)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const yearlyRevenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ])

    // Get monthly revenue data for chart (daily breakdown of current month)
    const monthlyRevenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ])

    // Format revenue data for chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const revenueData = months.map((month, index) => {
      const monthIndex = index + 1
      const yearlyData = yearlyRevenueData.find((item) => item._id.month === monthIndex)

      // For monthly data, we'll use an average daily revenue for the month
      const monthlyAverage =
        monthlyRevenueData.length > 0
          ? monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0) / monthlyRevenueData.length
          : 0

      return {
        month,
        thisYear: yearlyData ? Math.round(yearlyData.revenue) : 0,
        thisMonth: monthIndex === now.getMonth() + 1 ? Math.round(monthlyAverage) : 0,
      }
    })

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
      lastMonthRevenueResult,
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

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            status: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ])

    const monthlyProductsSold = monthlyProductsSoldResult[0]?.totalSold || 0
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0

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
      lastMonthRevenue,
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
      lastMonthRevenue,
      monthlyStats: {
        productsSold: monthlyProductsSold,
        cancelledOrders: monthlyCancelledOrders,
        pendingDeliveries: pendingDeliveries,
        newUsers: monthlyNewUsers,
        newMessages: monthlyNewMessages,
        revenue: monthlyRevenue,
      },
      recentOrders,
      revenueData,
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
