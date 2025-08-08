import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { hashPassword } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request) {
  try {
    console.log("Registration attempt started...")
    await connectDB()

    const { name, email, password, phone } = await request.json()
    console.log("Registration attempt for:", { name, email })

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)
    console.log("Password hashed successfully")

    // Create user (always as regular user)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || "",
      role: "user", // Always create as regular user
    })

    const savedUser = await user.save()
    console.log("User created successfully:", savedUser._id, "with role:", savedUser.role)

    // Return user data (without password)
    const userData = {
      id: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully. Contact admin to get admin access if needed.",
      user: userData,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
