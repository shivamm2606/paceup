import User from "../models/user.model.js";
import {
  IAuthService,
  RegisterDto,
  LoginDto,
  RegisterResut,
  LoginResult,
  RefreshTokenResult,
} from "../types/auth.types.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { generateOTP, getOTPExpiry } from "../utils/otp.js";
import { sendEmail } from "../utils/mailer.js";
import crypto from "crypto";
import {
  getResetPasswordHtml,
  getResendOtpHtml,
  getVerifyEmailHtml,
} from "../utils/mailTemplates.js";

class MongoAuthService implements IAuthService {
  registerUser = async (dto: RegisterDto): Promise<RegisterResut> => {
    const { name, email, username, password } = dto;

    const existingUsers = await User.find({ $or: [{ email }, { username }] });

    for (const user of existingUsers) {
      if (user.isVerified) {
        throw new ApiError(400, "Email or username already in use.");
      }
    }

    if (existingUsers.length > 0) {
      await User.deleteMany({
        _id: { $in: existingUsers.map((user) => user._id) },
      });
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    const newUser = await User.create({
      name,
      email,
      username,
      password,
      otp,
      otpExpiry,
    });

    if (!newUser) {
      throw new ApiError(500, "User creation failed.");
    }

    sendEmail(
      email,
      "Verify your RepUp account",
      getVerifyEmailHtml(otp),
    ).catch((err) => {
      console.error("Failed to send OTP email:", err);
    });

    return {
      _id: newUser._id.toString(),
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
    };
  };

  loginUser = async (dto: LoginDto): Promise<LoginResult> => {
    const { email, password } = dto;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new ApiError(400, "Invalid email or password");
    }

    const isCorrect = await user.isPasswordCorrect(password);

    if (!isCorrect) {
      throw new ApiError(400, "Invalid email or password");
    }

    if (!user.isVerified) {
      throw new ApiError(403, "Email not verified");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        userInfo: user.userInfo,
      },
      accessToken,
      refreshToken,
    };
  };

  logoutUser = async (userId: string): Promise<void> => {
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 },
    });
  };

  refreshToken = async (
    incomingRefreshToken: string,
  ): Promise<RefreshTokenResult> => {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    let decoded: { _id: string };
    try {
      decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as { _id: string };
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded._id).select("+refreshToken");

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const newAccessToken = await user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  };

  verifyOtp = async (email: string, otp: string): Promise<void> => {
    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (user.isVerified) {
      throw new ApiError(400, "User already verified.");
    }

    if (!user.otp || !user.otpExpiry) {
      throw new ApiError(400, "OTP not found. Please request a new one.");
    }

    if (user.otpExpiry < new Date()) {
      throw new ApiError(400, "OTP expired. Please request a new one.");
    }

    if (user.otp !== otp) {
      throw new ApiError(400, "Invalid OTP.");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
  };

  resendOtp = async (email: string): Promise<void> => {
    const user = await User.findOne({ email }).select("+otp +otpExpiry");

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (user.isVerified) {
      throw new ApiError(400, "User already verified.");
    }

    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    sendEmail(email, "Your new RepUp OTP", getResendOtpHtml(otp)).catch(
      (err) => {
        console.error("Failed to resend OTP email:", err);
      },
    );
  };

  forgotPassword = async (email: string): Promise<void> => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    if (!user.isVerified) {
      throw new ApiError(
        403,
        "Email not verified. Please verify your account first.",
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiry;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    sendEmail(
      email,
      "Reset your RepUp password",
      getResetPasswordHtml(resetLink),
    ).catch((err) => {
      console.error("Failed to send reset password email:", err);
    });
  };

  resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const user = await User.findOne({ resetPasswordToken: token }).select(
      "+resetPasswordToken +resetPasswordExpiry",
    );

    if (!user) {
      throw new ApiError(400, "Invalid or expired token.");
    }

    if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
      throw new ApiError(400, "Token expired. Please request a new one.");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshToken = undefined;
    await user.save();
  };
}

export default new MongoAuthService();
