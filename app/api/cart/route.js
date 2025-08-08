import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Cart from "@/lib/models/Cart"
import Product from "@/lib/models/Product"
import { getTokenFromRequest } from "@/lib/auth"
import jwt from "jsonwebtoken"

export async function GET(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    let cart = await Cart.findOne({ user: decoded.userId }).populate("items.product", "name price images stock")

    if (cart) {
      const originalItemCount = cart.items.length
      cart.items = cart.items.filter((item) => item.product)

      if (cart.items.length !== originalItemCount) {
        await cart.save()
      }
    }

    return NextResponse.json({
      success: true,
      cart: cart || { items: [] },
    })
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { productId, quantity = 1 } = await request.json()

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    // Verify product exists and is available
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ success: false, error: "Product is not available" }, { status: 400 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ success: false, error: "Insufficient stock" }, { status: 400 })
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: decoded.userId })

    if (!cart) {
      cart = new Cart({ user: decoded.userId, items: [] })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity
      if (newQuantity > product.stock) {
        return NextResponse.json(
          { success: false, error: "Cannot add more items than available stock" },
          { status: 400 },
        )
      }
      cart.items[existingItemIndex].quantity = newQuantity
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity })
    }

    await cart.save()

    // Populate cart for response
    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price images stock")

    return NextResponse.json({
      success: true,
      message: "Item added to cart successfully",
      cart: populatedCart,
    })
  } catch (error) {
    console.error("Add to cart error:", error)
    return NextResponse.json({ success: false, error: "Failed to add item to cart" }, { status: 500 })
  }
}
