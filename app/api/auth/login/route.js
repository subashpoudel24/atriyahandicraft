import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { comparePassword, generateToken } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request) {
  try {
    console.log("Login attempt started...")
    await connectDB()

    const { email, password } = await request.json()
    console.log("Login attempt for email:", email)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log("No user found with email:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    console.log("User found:", user.email, "Role:", user.role)

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    console.log("Password valid, generating token...")

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    })

    console.log("Token generated successfully")

    // Return user data (without password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    }

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
