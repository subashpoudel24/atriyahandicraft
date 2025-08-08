import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { hashPassword } from "@/lib/auth"

export async function POST(request) {
  try {
    console.log("👑 Creating admin user...")
    await connectDB()

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@test.com" })
    if (existingAdmin) {
      console.log("✅ Admin user already exists")
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
        credentials: {
          email: "admin@test.com",
          password: "admin123",
          role: existingAdmin.role,
        },
      })
    }

    // Hash password
    const hashedPassword = await hashPassword("admin123")
    console.log("🔒 Password hashed successfully")

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
    })

    await adminUser.save()
    console.log("✅ Admin user created successfully:", adminUser._id)

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      credentials: {
        email: "admin@test.com",
        password: "admin123",
        role: "admin",
      },
      userId: adminUser._id,
    })
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin user",
      },
      { status: 500 },
    )
  }
}

export async function GET(request) {
  return POST(request)
}
