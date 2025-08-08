import { NextResponse } from "next/server"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

export async function GET(request) {
  try {
    console.log("Token verification test started...")

    const token = getTokenFromRequest(request)
    console.log("Token extracted:", token ? "Yes" : "No")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No token provided",
        },
        { status: 401 },
      )
    }

    const decoded = await verifyToken(token)
    console.log("Token decoded:", decoded)

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Token is valid",
      user: {
        userId: decoded.userId,
        role: decoded.role,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Token verification failed",
      },
      { status: 500 },
    )
  }
}
