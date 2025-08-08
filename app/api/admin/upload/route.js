import { NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { uploadImage } from "@/lib/cloudinary";
export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert buffer to data URI
    const dataURI = `data:${file.type};base64,${buffer.toString("base64")}`;

    const data = await uploadImage(dataURI);

    return NextResponse.json({ success: true, url: data.url, public_id: data.public_id });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 });
  }
}
