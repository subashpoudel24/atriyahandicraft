import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Contact from "@/lib/models/Contact"
import { getTokenFromRequest } from "@/lib/auth"
import jwt from "jsonwebtoken"

export async function GET(request, { params }) {
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

    const { id } = params
    const message = await Contact.findById(id)

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    // Mark as read if it's new
    if (message.status === "new") {
      message.status = "read"
      await message.save()
    }

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error("Message fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch message" }, { status: 500 })
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

    const { id } = params
    const { status, adminNotes } = await request.json()

    const message = await Contact.findByIdAndUpdate(
      id,
      { status, adminNotes, updatedAt: new Date() },
      { new: true, runValidators: true },
    )

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Message updated successfully",
      data: message,
    })
  } catch (error) {
    console.error("Message update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update message" }, { status: 500 })
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

    const { id } = params
    const message = await Contact.findByIdAndDelete(id)

    if (!message) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (error) {
    console.error("Message delete error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete message" }, { status: 500 })
  }
}
