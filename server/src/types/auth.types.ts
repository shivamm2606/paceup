import type { RegisterDto, LoginDto } from "../validator/auth.validator.js";
import type { IUserInfo } from "./user.types.js";

export type { RegisterDto, LoginDto };

export interface IAuthService {
  registerUser(dto: RegisterDto): Promise<RegisterResult>;
  loginUser(dto: LoginDto): Promise<LoginResult>;
  logoutUser(userId: string): Promise<void>;
  refreshToken(incomingRefreshToken: string): Promise<RefreshTokenResult>;
  verifyOtp(email: string, otp: string): Promise<void>;
  resendOtp(email: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

export interface RegisterResult {
  _id: string;
  username: string;
  name: string;
  email: string;
}

export interface LoginUser extends RegisterResult {
  userInfo?: IUserInfo;
}

export interface LoginResult {
  user: LoginUser;
  accessToken: string;
  refreshToken: string;
}
export interface RefreshTokenResult {
  user: RegisterResult;
  accessToken: string;
  refreshToken: string;
}
