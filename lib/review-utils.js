import Review from "./models/Review.js"
import Product from "./models/Product.js"
import mongoose from "mongoose" // Declare mongoose variable

// Create a new review
export const createReview = async (userId, productId, rating, comment) => {
    try {
        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            user: userId,
            product: productId,
        })

        if (existingReview) {
            throw new Error("You have already reviewed this product")
        }

        // Verify product exists
        const product = await Product.findById(productId)
        if (!product) {
            throw new Error("Product not found")
        }

        // Create review
        const review = new Review({
            user: userId,
            product: productId,
            rating,
            comment,
        })

        await review.save()

        // Update product review statistics
        await product.updateReviewStats()

        // Populate user data for response
        await review.populate("user", "name")

        return review
    } catch (error) {
        throw error
    }
}

// Get reviews for a product
export const getProductReviews = async (productId, page = 1, limit = 10, sortBy = "newest") => {
    try {
        const skip = (page - 1) * limit

        let sortOption = { createdAt: -1 } // newest first
        if (sortBy === "oldest") sortOption = { createdAt: 1 }
        if (sortBy === "highest") sortOption = { rating: -1 }
        if (sortBy === "lowest") sortOption = { rating: 1 }

        const reviews = await Review.find({
            product: productId,
            isApproved: true,
        })
            .populate("user", "name")
            .sort(sortOption)
            .skip(skip)
            .limit(limit)

        const totalReviews = await Review.countDocuments({
            product: productId,
            isApproved: true,
        })

        const totalPages = Math.ceil(totalReviews / limit)

        return {
            reviews,
            pagination: {
                currentPage: page,
                totalPages,
                totalReviews,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        }
    } catch (error) {
        throw error
    }
}

// Update a review
export const updateReview = async (reviewId, userId, rating, comment) => {
    try {
        const review = await Review.findOne({
            _id: reviewId,
            user: userId,
        })

        if (!review) {
            throw new Error("Review not found or unauthorized")
        }

        review.rating = rating
        review.comment = comment
        await review.save()

        // Update product review statistics
        const product = await Product.findById(review.product)
        await product.updateReviewStats()

        await review.populate("user", "name")
        return review
    } catch (error) {
        throw error
    }
}

// Delete a review
export const deleteReview = async (reviewId, userId, isAdmin = false) => {
    try {
        const query = isAdmin ? { _id: reviewId } : { _id: reviewId, user: userId }
        const review = await Review.findOne(query)

        if (!review) {
            throw new Error("Review not found or unauthorized")
        }

        const productId = review.product
        await Review.findByIdAndDelete(reviewId)

        // Update product review statistics
        const product = await Product.findById(productId)
        await product.updateReviewStats()

        return { message: "Review deleted successfully" }
    } catch (error) {
        throw error
    }
}

// Get user's reviews
export const getUserReviews = async (userId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit

        const reviews = await Review.find({ user: userId })
            .populate("product", "name images price")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const totalReviews = await Review.countDocuments({ user: userId })
        const totalPages = Math.ceil(totalReviews / limit)

        return {
            reviews,
            pagination: {
                currentPage: page,
                totalPages,
                totalReviews,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        }
    } catch (error) {
        throw error
    }
}

// Get review statistics for a product
export const getReviewStats = async (productId) => {
    try {
        const stats = await Review.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId),
                    isApproved: true,
                },
            },
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
        ])

        // Create rating distribution (5 stars to 1 star)
        const distribution = [5, 4, 3, 2, 1].map((rating) => {
            const found = stats.find((stat) => stat._id === rating)
            return {
                rating,
                count: found ? found.count : 0,
            }
        })

        const totalReviews = stats.reduce((sum, stat) => sum + stat.count, 0)
        const averageRating =
            totalReviews > 0 ? stats.reduce((sum, stat) => sum + stat._id * stat.count, 0) / totalReviews : 0

        return {
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            distribution,
        }
    } catch (error) {
        throw error
    }
}
