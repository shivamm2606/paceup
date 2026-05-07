import MongoAuthService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const cookieOptions: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "none" | "lax" | "strict";
  maxAge: number;
} = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

export const registerUser = asyncHandler(async (req, res) => {
  const result = await MongoAuthService.registerUser(req.body);

  res
    .status(201)
    .json(new ApiResponse(201, result, "User registered Successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const result = await MongoAuthService.loginUser(req.body);

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        ...result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      "User logged in Successfully",
    ),
  );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await MongoAuthService.logoutUser(req.user._id.toString());

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json(new ApiResponse(200, {}, "User logged out"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  const result = await MongoAuthService.refreshToken(incomingRefreshToken);

  res.cookie("accessToken", result.accessToken, cookieOptions);
  res.cookie("refreshToken", result.refreshToken, cookieOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        ...result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      "Tokens refreshed Successfully",
    ),
  );
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  await MongoAuthService.verifyOtp(email, otp);
  res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await MongoAuthService.resendOtp(email);
  res.status(200).json(new ApiResponse(200, {}, "OTP resent successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await MongoAuthService.forgotPassword(email);
  res.status(200).json(new ApiResponse(200, {}, "Password reset email sent"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await MongoAuthService.resetPassword(token, newPassword);
  res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});
