import api from "./axios";
import type { ApiResponse, User } from "@/types/auth.types";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/user.types";

export interface AddressInput {
  label: string;
  street: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export const userApi = {
  getProfile: () =>
    api.get<ApiResponse<User>>("/user/profile"),

  updateProfile: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<User>>("/auth/profile", data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<ApiResponse<null>>("/auth/change-password", data),

  addAddress: (data: AddressInput) =>
    api.post<ApiResponse<User>>("/user/addresses", data),

  removeAddress: (addressId: string) =>
    api.delete<ApiResponse<User>>(`/user/addresses/${addressId}`),

  setDefaultAddress: (addressId: string) =>
    api.patch<ApiResponse<User>>(`/user/addresses/${addressId}/default`),
};
