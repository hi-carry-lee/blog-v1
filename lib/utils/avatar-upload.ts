import { validateImageFile } from "@/lib/utils/file-validation";
import { uploadImageFile } from "@/lib/utils/upload";
import { updateUserAvatar } from "@/lib/actions/user";
import { UPLOAD_FOLDERS } from "@/lib/config/file-upload";
import { logger } from "@/lib/logger";

/**
 * 删除 Cloudinary 中的图片
 *
 * @param publicId - Cloudinary 图片的 public_id
 */
async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    const response = await fetch("/api/upload/cleanup", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_id: publicId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to delete image");
    }
  } catch (error) {
    logger.error("Failed to cleanup uploaded image from Cloudinary", {
      publicId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    // 不抛出错误，避免影响主流程
  }
}

/**
 * 上传并更新用户头像（完整业务流程）
 *
 * 这是一个客户端函数，负责：
 * 1. 验证文件
 * 2. 上传文件到 Cloudinary
 * 3. 更新数据库中的头像 URL
 * 4. 如果数据库更新失败，自动清理已上传的图片
 *
 * @param file - 要上传的图片文件
 * @param userId - 用户 ID
 * @returns 操作结果，包含成功或失败的信息
 *
 * @example
 * ```typescript
 * const result = await uploadAndUpdateAvatar(file, userId);
 * if (result.success && result.user) {
 *   console.log("Avatar updated:", result.user.image);
 * }
 * ```
 */
export async function uploadAndUpdateAvatar(
  file: File,
  userId: string
): Promise<
  | {
      success: true;
      user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        updatedAt: Date;
      };
    }
  | { success: false; error: string }
> {
  let uploadedPublicId: string | null = null;
  let dbUpdateSuccess = false;

  try {
    // 1. 验证文件
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.detail,
      };
    }

    // 2. 上传文件到 Cloudinary
    const uploadResponse = await uploadImageFile(file, UPLOAD_FOLDERS.AVATARS);
    if (!uploadResponse.success) {
      return {
        success: false,
        error: uploadResponse.error || "Failed to upload image",
      };
    }

    // 保存 public_id，用于后续可能的清理操作
    uploadedPublicId = uploadResponse.public_id;

    // 3. 更新数据库
    const updateResult = await updateUserAvatar(uploadResponse.url, userId);
    if (!updateResult.success || !updateResult.user) {
      return {
        success: false,
        error: updateResult.error || "Failed to update avatar",
      };
    }

    // 标记数据库更新成功
    dbUpdateSuccess = true;

    return {
      success: true,
      user: updateResult.user,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  } finally {
    // 如果上传成功但数据库更新失败，清理已上传的图片
    if (uploadedPublicId && !dbUpdateSuccess) {
      // 异步删除，不阻塞返回
      deleteImageFromCloudinary(uploadedPublicId).catch((err) => {
        logger.error("Error in cleanup process", {
          publicId: uploadedPublicId,
          error: err,
        });
      });
    }
  }
}
