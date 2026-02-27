import { Request, Response } from "express";
import { menuService } from "../services/menu.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const createMenu = async (req: Request, res: Response) => {
  const cookId = req.userId!;
  const { kitchenId } = req.params;
  const result = await menuService.createMenu(kitchenId as string, cookId, req.body);
  sendSuccess(res, 201, "Menu created", result);
};

export const getMenusByKitchen = async (req: Request, res: Response) => {
  const { kitchenId } = req.params;
  const result = await menuService.getMenusByKitchen(kitchenId as string);
  sendSuccess(res, 200, "Menus retrieved", result);
};

export const updateMenu = async (req: Request, res: Response) => {
  const cookId = req.userId!;
  const { menuId } = req.params;
  const result = await menuService.updateMenu(menuId as string, cookId, req.body);
  sendSuccess(res, 200, "Menu updated", result);
};

export const toggleDishStatus = async (req: Request, res: Response) => {
  const cookId = req.userId!;
  const { menuId, dishId } = req.params;
  const { status } = req.body;
  const result = await menuService.toggleDishStatus(menuId as string, dishId as string, status, cookId);
  sendSuccess(res, 200, "Dish status updated", result);
};

export const copyYesterdayMenu = async (req: Request, res: Response) => {
  const cookId = req.userId!;
  const { kitchenId } = req.params;
  const result = await menuService.copyYesterdayMenu(kitchenId as string, cookId);
  sendSuccess(res, 201, "Yesterday's menu copied", result);
};

export const getTodayMenus = async (req: Request, res: Response) => {
  const { lng, lat, maxDistance } = req.query;
  const result = await menuService.getTodayMenus(
    lng ? Number(lng) : undefined,
    lat ? Number(lat) : undefined,
    maxDistance ? Number(maxDistance) : undefined
  );
  sendSuccess(res, 200, "Today's menus retrieved", result);
};

export const searchDishes = async (req: Request, res: Response) => {
  const result = await menuService.searchDishes(req.query);
  sendSuccess(res, 200, "Dishes retrieved", result);
};

export const getTrendingDishes = async (req: Request, res: Response) => {
  const { lng, lat, maxDistance, limit } = req.query;
  const result = await menuService.getTrendingDishes(
    lng ? Number(lng) : undefined,
    lat ? Number(lat) : undefined,
    maxDistance ? Number(maxDistance) : undefined,
    limit ? Number(limit) : undefined
  );
  sendSuccess(res, 200, "Trending dishes retrieved", result);
};
