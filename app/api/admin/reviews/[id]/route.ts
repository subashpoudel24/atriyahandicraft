import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Review from "@/lib/models/Review"
import Product from "@/lib/models/Product"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const reviewId = params.id

    // Find the review to get the product ID
    const review = await Review.findById(reviewId)
    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 })
    }

    const productId = review.product

    // Delete the review
    await Review.findByIdAndDelete(reviewId)

    // Update product rating statistics
    const remainingReviews = await Review.find({ product: productId })

    let averageRating = 0
    const totalReviews = remainingReviews.length

    if (totalReviews > 0) {
      const totalRating = remainingReviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = totalRating / totalReviews
    }

    // Update the product with new statistics
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews,
    })

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ success: false, message: "Failed to delete review" }, { status: 500 })
  }
}
