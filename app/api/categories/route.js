import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Category from "@/lib/models/Category"
import { getTokenFromRequest } from "@/lib/auth"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    await connectDB()

    // Get all active categories (no authentication required for reading)
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean()

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    // Get and verify token for creating categories
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

    const { name, description } = await request.json()

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 })
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    })

    if (existingCategory) {
      return NextResponse.json({ success: false, error: "Category already exists" }, { status: 400 })
    }

    // Create new category
    const category = new Category({
      name: name.trim(),
      description: description?.trim() || "",
      isActive: true,
    })

    await category.save()

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category,
    })
  } catch (error) {
    console.error("Category creation error:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
  }
}
