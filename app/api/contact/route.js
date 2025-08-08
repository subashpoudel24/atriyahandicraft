import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Contact from "@/lib/models/Contact"

export async function POST(request) {
  try {
    await connectDB()

    const { name, email, phone, subject, message } = await request.json()

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, subject, and message are required",
        },
        { status: 400 },
      )
    }

    // Create new contact message
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      subject: subject.trim(),
      message: message.trim(),
      status: "new",
    })

    await contact.save()

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
      },
    })
  } catch (error) {
    console.error("Contact form error:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return NextResponse.json(
        {
          success: false,
          error: errors.join(", "),
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message. Please try again later.",
      },
      { status: 500 },
    )
  }
}
