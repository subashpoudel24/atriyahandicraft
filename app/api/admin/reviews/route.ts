import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Review from "@/lib/models/Review"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get all reviews with populated user and product data
    const reviews = await Review.find({})
      .populate("user", "name email")
      .populate("product", "name images")
      .sort({ createdAt: -1 })

    // Group reviews by product
    const productReviewsMap = new Map()

    reviews.forEach((review) => {
      const productId = review.product._id.toString()

      if (!productReviewsMap.has(productId)) {
        productReviewsMap.set(productId, {
          product: review.product,
          reviews: [],
          totalRating: 0,
          totalReviews: 0,
        })
      }

      const productData = productReviewsMap.get(productId)
      productData.reviews.push(review)
      productData.totalRating += review.rating
      productData.totalReviews += 1
    })

    // Convert map to array and calculate average ratings
    const productReviews = Array.from(productReviewsMap.values()).map((productData) => ({
      product: productData.product,
      reviews: productData.reviews,
      averageRating: productData.totalReviews > 0 ? productData.totalRating / productData.totalReviews : 0,
      totalReviews: productData.totalReviews,
    }))

    // Sort by total reviews (most reviewed products first)
    productReviews.sort((a, b) => b.totalReviews - a.totalReviews)

    return NextResponse.json({
      success: true,
      productReviews,
    })
  } catch (error) {
    console.error("Error fetching admin reviews:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch reviews" }, { status: 500 })
  }
}
