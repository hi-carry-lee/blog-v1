import { validateImageFile } from "@/lib/utils/file-validation";
import { uploadImageFile } from "@/lib/utils/upload";
import { updateUserAvatar } from "@/lib/actions/user";
import { UPLOAD_FOLDERS } from "@/lib/config/file-upload";

/**
 * 上传并更新用户头像（完整业务流程）
 *
 * 这是一个客户端函数，负责：
 * 1. 验证文件
 * 2. 上传文件到 Cloudinary
 * 3. 更新数据库中的头像 URL
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

    // 3. 更新数据库
    const updateResult = await updateUserAvatar(uploadResponse.url, userId);
    if (!updateResult.success || !updateResult.user) {
      return {
        success: false,
        error: updateResult.error || "Failed to update avatar",
      };
    }

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
  }
}
