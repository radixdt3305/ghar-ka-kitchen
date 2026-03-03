import axios from "axios";

const createApiClient = (baseURL: string) => {
  const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            const { data } = await axios.post("/api/auth/refresh-token", {
              refreshToken,
            });
            const newAccess = data.data.accessToken;
            const newRefresh = data.data.refreshToken;

            localStorage.setItem("accessToken", newAccess);
            localStorage.setItem("refreshToken", newRefresh);

            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          } catch {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
};

const api = createApiClient("/api");
export const apiClient = createApiClient("/api");

export default api;
