import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 删除单个图片
 */
export async function DELETE(request: NextRequest) {
  try {
    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({
      success: result.result === "ok",
      result: result.result,
    });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

/**
 * 批量删除图片
 */
export async function POST(request: NextRequest) {
  try {
    const { public_ids } = await request.json();

    if (!public_ids || !Array.isArray(public_ids)) {
      return NextResponse.json(
        { error: "Public IDs array is required" },
        { status: 400 }
      );
    }

    const result = await cloudinary.api.delete_resources(public_ids);

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      not_found: result.not_found,
    });
  } catch (error) {
    console.error("Batch delete error:", error);
    return NextResponse.json({ error: "Batch delete failed" }, { status: 500 });
  }
}
