import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  FILE_VALIDATION_ERRORS,
} from "@/lib/config/file-upload";

/**
 * 文件验证结果类型
 */
export type FileValidationResult =
  | { valid: true }
  | { valid: false; error: string; detail: string };

/**
 * 验证图片文件（客户端和服务端通用）
 *
 * @param file - 要验证的文件对象
 * @returns 验证结果，包含是否有效和错误信息
 *
 * @example
 * ```typescript
 * const result = validateImageFile(file);
 * if (!result.valid) {
 *   console.error(result.error, result.detail);
 * }
 * ```
 */
export function validateImageFile(file: File): FileValidationResult {
  // 验证文件类型
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error: FILE_VALIDATION_ERRORS.INVALID_TYPE,
      detail: FILE_VALIDATION_ERRORS.INVALID_TYPE_DETAIL,
    };
  }

  // 验证文件大小
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: FILE_VALIDATION_ERRORS.FILE_TOO_LARGE,
      detail: FILE_VALIDATION_ERRORS.FILE_TOO_LARGE_DETAIL,
    };
  }

  return { valid: true };
}
