import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const exclude = searchParams.get("exclude")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build query
    const query= { isActive: true }

    // Filter by category if provided
    if (category) {
      query.category = category
    }

    // Exclude specific product if provided
    if (exclude) {
      query._id = { $ne: exclude }
    }

    // Fetch products with category population
    const products = await Product.find(query)
      .populate("category", "name description")
      .select("name description price images category material stock averageRating totalReviews isActive")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const total = await Product.countDocuments(query)

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + products.length < total,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}
