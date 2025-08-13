import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "",
        },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    material: {
      type: String,
      default: "Pashmina",
    },
    care: {
      type: String,
      default: "Dry clean only",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
productSchema.index({ name: "text", description: "text" })
productSchema.index({ category: 1 })
productSchema.index({ featured: 1 })
productSchema.index({ price: 1 })
productSchema.index({ averageRating: -1 })

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
})

productSchema.methods.updateReviewStats = async function () {
  const Review = mongoose.model("Review")
  const stats = await Review.getAverageRating(this._id)

  this.averageRating = Math.round(stats.averageRating * 10) / 10 // Round to 1 decimal
  this.totalReviews = stats.totalReviews

  await this.save()
}

export default mongoose.models.Product || mongoose.model("Product", productSchema)
