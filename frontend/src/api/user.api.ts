import api from "./axios";
import type { ApiResponse, User } from "@/types/auth.types";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/user.types";

export const userApi = {
  updateProfile: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<User>>("/auth/profile", data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<ApiResponse<null>>("/auth/change-password", data),
};
