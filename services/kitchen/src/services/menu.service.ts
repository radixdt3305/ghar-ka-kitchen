import { menuRepository } from "../repository/menu.repository.js";
import { kitchenRepository } from "../repository/kitchen.repository.js";
import { AppError } from "../utils/error.util.js";

export class MenuService {
  async createMenu(kitchenId: string, cookId: string, data: any) {
    const kitchen = await kitchenRepository.findById(kitchenId);
    if (!kitchen || kitchen.cookId !== cookId) {
      throw new AppError("Unauthorized", 403);
    }

    const existing = await menuRepository.findByKitchenAndDate(kitchenId, data.date);
    if (existing) {
      throw new AppError("Menu already exists for this date", 409);
    }

    return menuRepository.create({ ...data, kitchenId });
  }

  async getMenuById(menuId: string) {
    const menu = await menuRepository.findById(menuId);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }
    return menu;
  }

  async getMenusByKitchen(kitchenId: string) {
    return menuRepository.findByKitchen(kitchenId);
  }

  async updateMenu(menuId: string, cookId: string, data: any) {
    const menu = await menuRepository.findById(menuId);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }

    const kitchen = await kitchenRepository.findById(menu.kitchenId);
    if (!kitchen || kitchen.cookId !== cookId) {
      throw new AppError("Unauthorized", 403);
    }

    return menuRepository.update(menuId, data);
  }

  async toggleDishStatus(menuId: string, dishId: string, status: string, cookId: string) {
    const menu = await menuRepository.findById(menuId);
    if (!menu) {
      throw new AppError("Menu not found", 404);
    }

    const kitchen = await kitchenRepository.findById(menu.kitchenId);
    if (!kitchen || kitchen.cookId !== cookId) {
      throw new AppError("Unauthorized", 403);
    }

    return menuRepository.updateDishStatus(menuId, dishId, status);
  }

  async copyYesterdayMenu(kitchenId: string, cookId: string) {
    const kitchen = await kitchenRepository.findById(kitchenId);
    if (!kitchen || kitchen.cookId !== cookId) {
      throw new AppError("Unauthorized", 403);
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayMenu = await menuRepository.findByKitchenAndDate(kitchenId, yesterday);
    if (!yesterdayMenu) {
      throw new AppError("No menu found for yesterday", 404);
    }

    const today = new Date();
    const existingToday = await menuRepository.findByKitchenAndDate(kitchenId, today);
    if (existingToday) {
      throw new AppError("Menu already exists for today", 409);
    }

    return menuRepository.copyMenu(String(yesterdayMenu._id), today, kitchenId);
  }

  async getTodayMenus(lng?: number, lat?: number, maxDistance?: number) {
    return menuRepository.findTodayMenus(lng, lat, maxDistance);
  }

  async searchDishes(filters: any) {
    const { query, category, dietType, minPrice, maxPrice, lng, lat, maxDistance, sortBy } = filters;
    return menuRepository.searchDishes({
      query,
      category,
      dietType,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      lng: lng ? Number(lng) : undefined,
      lat: lat ? Number(lat) : undefined,
      maxDistance: maxDistance ? Number(maxDistance) : undefined,
      sortBy,
    });
  }

  async getTrendingDishes(lng?: number, lat?: number, maxDistance?: number, limit?: number) {
    return menuRepository.getTrendingDishes(
      lng ? Number(lng) : undefined,
      lat ? Number(lat) : undefined,
      maxDistance ? Number(maxDistance) : undefined,
      limit ? Number(limit) : 10
    );
  }
}

export const menuService = new MenuService();
