import http, { ApiResponse } from "./http";
import User from "@/models/User";

// REGISTER
export const register = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
}) => {
  return http.post<ApiResponse<{ user: User }>>("/auth/register", data);
};

// LOGIN
export const login = (data: {
  username: string;
  password: string;
  selectedRole?: string;
}) => {
  return http.post<
    ApiResponse<{
      accessToken: string;
      user: User;
    }>
  >("/auth/login", data);
};

// VERIFY EMAIL
export const verifyEmail = (data: { email: string; otp: string }) => {
  return http.post<
    ApiResponse<{
      userId: number;
    }>
  >("/auth/verify-email", data);
};

// RESEND OTP
export const resendOtp = (data: { email: string }) => {
  return http.post<
    ApiResponse<{
      message: string;
    }>
  >("/auth/resend-otp", data);
};

// FORGOT PASSWORD
export const forgotPassword = (data: { email: string }) => {
  return http.post<
    ApiResponse<{
      message: string;
    }>
  >("/auth/forgot-password", data);
};

// RESET PASSWORD
export const resetPassword = (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  return http.post<
    ApiResponse<{
      message: string;
    }>
  >("/auth/reset-password", data);
};

// LOGOUT
export const logout = () => {
  return http.post<
    ApiResponse<{
      message: string;
    }>
  >("/auth/logout");
};
