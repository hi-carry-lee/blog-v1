// 推荐的方式
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 转换为Buffer（更高效）
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 使用upload_stream - 最佳实践！
    // 使用Promise的目的在于：可以使用await，进而可以 return NextResponse
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "ai-blog-avatars",
          resource_type: "auto",
          transformation: [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else
            resolve({
              secure_url: result?.secure_url || "",
              public_id: result?.public_id || "",
            });
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
