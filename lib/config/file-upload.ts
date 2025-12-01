/**
 * 文件上传相关配置常量
 */

// 允许的图片文件类型
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const; // as const用来定义字面量类型，防止被修改

// 允许的图片文件类型（类型定义）
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

// 文件大小限制（字节）
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// 文件大小限制（MB，用于显示）
export const MAX_FILE_SIZE_MB = 5;

// 上传文件夹名称
export const UPLOAD_FOLDERS = {
  AVATARS: "avatars",
  COVER_IMAGES: "cover-images",
} as const; // as const用来定义字面量类型，防止被修改

// 错误消息
export const FILE_VALIDATION_ERRORS = {
  INVALID_TYPE: "Invalid file type",
  INVALID_TYPE_DETAIL: "Please select a JPEG, PNG, or WebP image.",
  FILE_TOO_LARGE: "File too large",
  FILE_TOO_LARGE_DETAIL: `Please select an image smaller than ${MAX_FILE_SIZE_MB}MB.`,
} as const;
// as const用来定义字面量类型，防止被修改
