import { logger } from "@/lib/logger";
import type { UploadResponse } from "@/types/types";

/**
 * 上传图片到 Cloudinary
 *
 * @param formData - 包含文件和文件夹信息的 FormData
 * @returns 上传结果，包含成功或失败的信息
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append("file", file);
 * formData.append("folder", "avatars");
 * const result = await uploadImage(formData);
 * if (result.success) {
 *   console.log(result.url, result.public_id);
 * }
 * ```
 */
export async function uploadImage(formData: FormData): Promise<UploadResponse> {
  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
      public_id: data.public_id,
    };
  } catch (error) {
    logger.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
      url: "",
      public_id: "",
    };
  }
}

/**
 * 上传图片文件到 Cloudinary（简化版）
 *
 * @param file - 要上传的文件对象
 * @param folder - 上传到的文件夹名称
 * @returns 上传结果，包含成功或失败的信息
 *
 * @example
 * ```typescript
 * const result = await uploadImageFile(file, "avatars");
 * if (result.success) {
 *   console.log(result.url, result.public_id);
 * }
 * ```
 */
export async function uploadImageFile(
  file: File,
  folder: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  return uploadImage(formData);
}
