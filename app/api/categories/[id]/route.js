import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Category from "@/lib/models/Category"
import Product from "@/lib/models/Product"
import { getTokenFromRequest } from "@/lib/auth"
import jwt from "jsonwebtoken"

export async function GET(request, { params }) {
  try {
    await connectDB()

    const category = await Category.findById(params.id).lean()

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      category,
    })
  } catch (error) {
    console.error("Category fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    // Get and verify token
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    const { name, description, isActive } = await request.json()

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 })
    }

    // Check if category exists
    const category = await Category.findById(params.id)
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    // Check if another category with the same name exists (excluding current one)
    const existingCategory = await Category.findOne({
      _id: { $ne: params.id },
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    })

    if (existingCategory) {
      return NextResponse.json({ success: false, error: "Category name already exists" }, { status: 400 })
    }

    // Update category
    category.name = name.trim()
    category.description = description?.trim() || ""
    if (isActive !== undefined) {
      category.isActive = isActive
    }

    await category.save()

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category,
    })
  } catch (error) {
    console.error("Category update error:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    // Get and verify token
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 })
    }

    // Check if category exists
    const category = await Category.findById(params.id)
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    // Check if any products are using this category
    const productsUsingCategory = await Product.countDocuments({ category: params.id })
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category. ${productsUsingCategory} product(s) are using this category.`,
        },
        { status: 400 },
      )
    }

    // Delete category
    await Category.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Category deletion error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
  }
}
