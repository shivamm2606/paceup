const getVerifyEmailHtml = (otp: string) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #111;">Verify your RepUp account</h2>
  <p style="color: #444;">Thanks for signing up! Use the OTP below to verify your email address.</p>
  <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111; background: #f5f5f5; padding: 16px; text-align: center; border-radius: 6px; margin: 24px 0;">
    ${otp}
  </div>
  <p style="color: #888; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
  <p style="color: #aaa; font-size: 12px;">If you didn't create a RepUp account, ignore this email.</p>
</div>`;

const getResendOtpHtml = (otp: string) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #111;">Your new OTP</h2>
  <p style="color: #444;">You requested a new OTP for your RepUp account. Here it is:</p>
  <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111; background: #f5f5f5; padding: 16px; text-align: center; border-radius: 6px; margin: 24px 0;">
    ${otp}
  </div>
  <p style="color: #888; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
  <p style="color: #aaa; font-size: 12px;">If you didn't request this, ignore this email.</p>
</div>`;

const getResetPasswordHtml = (resetLink: string) => `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #111;">Reset your password</h2>
  <p style="color: #444;">We received a request to reset your RepUp password. Click the button below to proceed.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${resetLink}" style="background: #111; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-weight: bold;">Reset Password</a>
  </div>
  <p style="color: #888; font-size: 13px;">This link expires in <strong>15 minutes</strong>. If you didn't request a password reset, ignore this email.</p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
  <p style="color: #aaa; font-size: 12px;">For security, never share this link with anyone.</p>
</div>`;

export { getVerifyEmailHtml, getResendOtpHtml, getResetPasswordHtml };
