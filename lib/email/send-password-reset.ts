"use server";

import { getResendClient } from "./resend-client";

/**
 * 发送密码重置邮件
 *
 * @param email - 用户邮箱
 * @param token - 密码重置 token
 * @returns 是否发送成功
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  try {
    const resend = getResendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(
      token
    )}`;

    // HTML 邮件模板
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 8px;
            }
            .header {
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: center;
              border: 1px solid #e5e7eb;
            }
            .header h1 {
              margin: 0;
              color: #1f2937;
              font-size: 24px;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              margin-bottom: 20px;
            }
            .content p {
              margin: 12px 0;
              font-size: 14px;
            }
            .reset-button {
              display: inline-block;
              background-color: #3b82f6;
              color: white;
              padding: 12px 32px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin: 20px 0;
              cursor: pointer;
            }
            .reset-button:hover {
              background-color: #2563eb;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 12px;
              color: #92400e;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              margin-top: 20px;
            }
            .divider {
              height: 1px;
              background-color: #e5e7eb;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>

            <div class="content">
              <p>Hello,</p>

              <p>We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.</p>

              <p>To reset your password, click the button below:</p>

              <center>
                <a href="${resetLink}" class="reset-button">Reset Password</a>
              </center>

              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">
                ${resetLink}
              </p>

              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
                <p style="margin: 8px 0 0 0;">This password reset link will expire in 1 hour. If the link has expired, please request a new password reset.</p>
              </div>

              <div class="divider"></div>

              <p style="font-size: 12px; color: #6b7280;">
                If you have any questions or didn't request a password reset, please contact our support team.
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0;">© ${new Date().getFullYear()} AI Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 文本版本（为不支持 HTML 的邮件客户端）
    const textContent = `
      Password Reset Request

      Hello,

      We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.

      To reset your password, visit the following link:
      ${resetLink}

      This password reset link will expire in 1 hour. If the link has expired, please request a new password reset.

      If you have any questions or didn't request a password reset, please contact our support team.

      © ${new Date().getFullYear()} AI Blog. All rights reserved.`.trim();

    const response = await resend.emails.send({
      // 未验证domain使用 Resend 默认邮箱，已验证domain需要使用该domain邮箱
      from: "noreply@kaili.dev",
      to: email,
      subject: "Reset Your Password - AI Blog",
      html: htmlContent,
      text: textContent,
    });

    if (response.error) {
      console.error("Failed to send password reset email:", response.error);
      return false;
    }

    console.log("Password reset email sent successfully to:", email);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
