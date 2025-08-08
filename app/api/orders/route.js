import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/lib/models/Order"
import Cart from "@/lib/models/Cart"
import Product from "@/lib/models/Product"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

export async function GET(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await Order.find({ user: decoded.userId })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 })

    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shippingAddress } = await request.json()

    // Get user's cart
    const cart = await Cart.findOne({ user: decoded.userId }).populate("items.product", "name price stock")

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${item.product.name}` }, { status: 400 })
      }
    }

    // Calculate total
    const totalAmount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)

    // Create order
    const order = new Order({
      user: decoded.userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      shippingAddress,
    })

    await order.save()

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } })
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: decoded.userId })

    const populatedOrder = await Order.findById(order._id).populate("items.product", "name images")

    return NextResponse.json({
      message: "Order placed successfully",
      order: populatedOrder,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
