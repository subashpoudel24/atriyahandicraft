import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
)

// Compound index to prevent duplicate reviews from same user for same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true })
reviewSchema.index({ product: 1 })
reviewSchema.index({ rating: 1 })
reviewSchema.index({ createdAt: -1 })

// Static method to calculate average rating for a product
reviewSchema.statics.getAverageRating = async function (productId) {
    const result = await this.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId),
                isApproved: true,
            },
        },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
            },
        },
    ])

    return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 }
}

export default mongoose.models.Review || mongoose.model("Review", reviewSchema)
