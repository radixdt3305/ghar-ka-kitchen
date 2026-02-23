export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}
