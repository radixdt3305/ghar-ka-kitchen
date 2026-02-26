export interface UpdateProfileRequest {
  name: string;
  email: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
