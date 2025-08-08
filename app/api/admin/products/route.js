import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"
import Category from "@/lib/models/Category"
import { getTokenFromRequest } from "@/lib/auth"
import jwt from "jsonwebtoken"

export async function GET(request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // Build query
    const query = {}
    if (category && category !== "all") {
      query.category = category
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Get total count
    const total = await Product.countDocuments(query)

    // Get products with pagination and populate category
    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

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
    console.error("Products fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request) {
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

    const productData = await request.json()

    // Validation
    if (!productData.name || !productData.name.trim()) {
      return NextResponse.json({ success: false, error: "Product name is required" }, { status: 400 })
    }

    if (!productData.price || isNaN(Number(productData.price)) || Number(productData.price) <= 0) {
      return NextResponse.json({ success: false, error: "Valid price is required" }, { status: 400 })
    }

    if (!productData.category) {
      return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 })
    }

    if (!productData.description || !productData.description.trim()) {
      return NextResponse.json({ success: false, error: "Product description is required" }, { status: 400 })
    }

    // Verify category exists and is active
    const categoryExists = await Category.findOne({
      _id: productData.category,
      isActive: true,
    })

    if (!categoryExists) {
      return NextResponse.json({ success: false, error: "Invalid category selected" }, { status: 400 })
    }

    // Process images - filter out empty ones
    const processedImages = productData.images
      ? productData.images.filter((img) => img && img.url && img.url.trim())
      : []

    // Process tags
    const processedTags = productData.tags
      ? Array.isArray(productData.tags)
        ? productData.tags
        : productData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []

    // Create new product
    const productToCreate = {
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: Number(productData.price),
      category: productData.category, // This will be stored as ObjectId reference
      stock: Number(productData.stock) || 0,
      featured: Boolean(productData.featured),
      images: processedImages,
      tags: processedTags,
      material: productData.material?.trim() || "Pashmina",
      care: productData.care?.trim() || "Dry clean only",
      isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
    }

    const product = new Product(productToCreate)
    await product.save()

    // Populate category for response
    await product.populate("category", "name")

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    })
  } catch (error) {
    console.error("Product creation error:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json({ success: false, error: errors.join(", ") }, { status: 400 })
    }

    if (error.name === "CastError") {
      return NextResponse.json({ success: false, error: "Invalid category ID" }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}
