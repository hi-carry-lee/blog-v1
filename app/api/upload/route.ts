// 推荐的方式
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

/*
为什么通过 API Router 上传图片？

1. 文件上传的技术限制
  Server Actions 在处理文件上传时有一些限制：
  FormData 处理：Server Actions 更适合处理表单数据，但对于大文件（如图片）的流式处理支持有限
  内存限制：Server Actions 有默认的请求体大小限制，对于图片上传可能不够
  流式处理：图片上传需要流式处理，API 路由在这方面更灵活
*/

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

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
          folder: `ai-blog/${folder}`,
          resource_type: "auto",
          transformation: [{ quality: "auto:good" }],
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
