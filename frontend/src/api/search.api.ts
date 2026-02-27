import api from "./axios";
import type { ApiResponse } from "@/types/auth.types";
import type { Kitchen } from "@/types/kitchen.types";

const SEARCH_BASE = "http://localhost:5002/api/search";

export const searchApi = {
  searchKitchens: (params: any) =>
    api.get<ApiResponse<Kitchen[]>>(`${SEARCH_BASE}/kitchens`, { params }),

  getNearbyKitchens: (lng: number, lat: number, maxDistance?: number) =>
    api.get<ApiResponse<Kitchen[]>>(`${SEARCH_BASE}/kitchens/nearby`, {
      params: { lng, lat, maxDistance },
    }),

  searchDishes: (params: any) =>
    api.get<ApiResponse<any[]>>(`${SEARCH_BASE}/dishes`, { params }),

  getTodayMenus: (lng?: number, lat?: number, maxDistance?: number) =>
    api.get<ApiResponse<any[]>>(`${SEARCH_BASE}/menus/today`, {
      params: { lng, lat, maxDistance },
    }),
};
