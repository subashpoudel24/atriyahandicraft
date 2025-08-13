import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { createReview, getProductReviews } from "@/lib/review-utils"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get user from token
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const userId = decoded.userId

    const { productId, rating, comment } = await request.json()

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID, rating, and comment are required",
        },
        { status: 400 },
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating must be between 1 and 5",
        },
        { status: 400 },
      )
    }

    const review = await createReview(userId, productId, rating, comment.trim())

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review,
    })
  } catch (error: any) {
    console.error("Review creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create review",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const sortBy = searchParams.get("sortBy") || "newest"

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 },
      )
    }

    const result = await getProductReviews(productId, page, limit, sortBy)

    return NextResponse.json({
      success: true,
      reviews: result.reviews,
      pagination: result.pagination,
    })
  } catch (error: any) {
    console.error("Reviews fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch reviews",
      },
      { status: 500 },
    )
  }
}
