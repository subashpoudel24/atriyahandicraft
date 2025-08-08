import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Cart from "@/lib/models/Cart"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cart = await Cart.findOne({ user: decoded.userId })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== params.productId)
    await cart.save()

    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price images stock")

    return NextResponse.json({
      message: "Item removed from cart",
      cart: populatedCart,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quantity } = await request.json()

    const cart = await Cart.findOne({ user: decoded.userId })

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === params.productId)

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 })
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      cart.items[itemIndex].quantity = quantity
    }

    await cart.save()

    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price images stock")

    return NextResponse.json({
      message: "Cart updated successfully",
      cart: populatedCart,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
