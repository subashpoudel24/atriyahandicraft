import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export const runtime = "nodejs"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 12
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "newest"
    const featured = searchParams.get("featured")

    // Build query
    const query = { isActive: true }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    if (category && category !== "all") {
      query.category = category
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    if (featured === "true") {
      query.featured = true
    }

    // Build sort
    let sort = {}
    switch (sortBy) {
      case "price-low":
        sort = { price: 1 }
        break
      case "price-high":
        sort = { price: -1 }
        break
      case "name":
        sort = { name: 1 }
        break
      case "oldest":
        sort = { createdAt: 1 }
        break
      default:
        sort = { createdAt: -1 }
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit).populate("category", "name description").lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Products GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
