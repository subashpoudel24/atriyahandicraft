import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key"

// Hash password using bcryptjs
export async function hashPassword(password) {
  try {
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
  } catch (error) {
    console.error("Error hashing password:", error)
    throw new Error("Password hashing failed")
  }
}

// Compare password using bcryptjs
export async function comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
  } catch (error) {
    console.error("Error comparing password:", error)
    throw new Error("Password comparison failed")
  }
}

// Generate JWT token
export function generateToken(payload) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
    return token
  } catch (error) {
    console.error("Error generating token:", error)
    throw new Error("Token generation failed")
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error.message)
    return null
  }
}

// Extract token from request
export function getTokenFromRequest(request) {
  try {
    // Try Authorization header first
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      return token
    }

    // Try cookies as fallback
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      }, {})

      if (cookies.token) {
        return cookies.token
      }
    }

    return null
  } catch (error) {
    console.error("Error extracting token:", error)
    return null
  }
}
