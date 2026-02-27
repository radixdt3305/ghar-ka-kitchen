import api from "./axios";
import type { ApiResponse } from "@/types/auth.types";
import type {
  Kitchen,
  CreateKitchenRequest,
  Menu,
  CreateMenuRequest,
  KitchenWithMenu,
  DishWithKitchen,
} from "@/types/kitchen.types";

const KITCHEN_BASE = "http://localhost:5001/api/kitchens";

export const kitchenApi = {
  // Kitchen endpoints
  createKitchen: (data: CreateKitchenRequest) =>
    api.post<ApiResponse<Kitchen>>(`${KITCHEN_BASE}`, data),

  getMyKitchen: () =>
    api.get<ApiResponse<Kitchen>>(`${KITCHEN_BASE}/my-kitchen`),

  updateKitchen: (kitchenId: string, data: Partial<CreateKitchenRequest>) =>
    api.put<ApiResponse<Kitchen>>(`${KITCHEN_BASE}/${kitchenId}`, data),

  // Menu endpoints
  createMenu: (kitchenId: string, data: CreateMenuRequest) =>
    api.post<ApiResponse<Menu>>(`${KITCHEN_BASE}/${kitchenId}/menus`, data),

  getMenus: (kitchenId: string) =>
    api.get<ApiResponse<Menu[]>>(`${KITCHEN_BASE}/${kitchenId}/menus`),

  updateMenu: (menuId: string, data: Partial<CreateMenuRequest>) =>
    api.put<ApiResponse<Menu>>(`${KITCHEN_BASE}/menus/${menuId}`, data),

  toggleDishStatus: (menuId: string, dishId: string, status: string) =>
    api.patch<ApiResponse<Menu>>(
      `${KITCHEN_BASE}/menus/${menuId}/dishes/${dishId}/status`,
      { status }
    ),

  copyYesterdayMenu: (kitchenId: string) =>
    api.post<ApiResponse<Menu>>(
      `${KITCHEN_BASE}/${kitchenId}/menus/copy-yesterday`
    ),

  // Discovery endpoints
  searchKitchens: (params: any) =>
    api.get<ApiResponse<Kitchen[]>>(`${KITCHEN_BASE}/search`, { params }),

  getNearbyKitchens: (lng: number, lat: number, maxDistance?: number) =>
    api.get<ApiResponse<Kitchen[]>>(`${KITCHEN_BASE}/nearby`, {
      params: { lng, lat, maxDistance },
    }),

  getKitchenById: (kitchenId: string) =>
    api.get<ApiResponse<Kitchen>>(`${KITCHEN_BASE}/${kitchenId}`),

  getTodayMenus: (lng?: number, lat?: number, maxDistance?: number) =>
    api.get<ApiResponse<any[]>>(`${KITCHEN_BASE}/menus/today`, {
      params: { lng, lat, maxDistance },
    }),

  searchDishes: (params: any) =>
    api.get<ApiResponse<any[]>>(`${KITCHEN_BASE}/dishes/search`, { params }),

  getTrendingDishes: (params?: any) =>
    api.get<ApiResponse<any[]>>(`${KITCHEN_BASE}/dishes/trending`, { params }),
};
