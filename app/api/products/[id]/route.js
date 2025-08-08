import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"
import Category from "@/lib/models/Category"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const product = await Product.findById(id).populate("category", "name description").lean()

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ success: false, error: "Product is not available" }, { status: 404 })
    }

    // Ensure category is properly structured
    if (!product.category) {
      product.category = {
        _id: null,
        name: "Uncategorized",
      }
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const { id } = params
    const updateData = await request.json()

    // Validate category if provided
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category)
      if (!categoryExists) {
        return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 })
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name description")

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const { id } = params
    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
  }
}
