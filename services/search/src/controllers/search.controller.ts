import { Request, Response } from "express";
import { searchService } from "../services/search.service.js";

export const searchKitchens = async (req: Request, res: Response) => {
  const result = await searchService.searchKitchens(req.query);
  res.json({ success: true, data: result });
};

export const getNearbyKitchens = async (req: Request, res: Response) => {
  const { lng, lat, maxDistance } = req.query;
  const result = await searchService.getNearbyKitchens(
    Number(lng),
    Number(lat),
    maxDistance ? Number(maxDistance) : undefined
  );
  res.json({ success: true, data: result });
};

export const searchDishes = async (req: Request, res: Response) => {
  const result = await searchService.searchDishes(req.query);
  res.json({ success: true, data: result });
};

export const getTodayMenus = async (req: Request, res: Response) => {
  const { lng, lat, maxDistance } = req.query;
  const result = await searchService.getTodayMenus(
    lng ? Number(lng) : undefined,
    lat ? Number(lat) : undefined,
    maxDistance ? Number(maxDistance) : undefined
  );
  res.json({ success: true, data: result });
};

export const getTrendingDishes = async (req: Request, res: Response) => {
  const { lng, lat, maxDistance, limit } = req.query;
  const result = await searchService.getTrendingDishes(
    lng ? Number(lng) : undefined,
    lat ? Number(lat) : undefined,
    maxDistance ? Number(maxDistance) : undefined,
    limit ? Number(limit) : undefined
  );
  res.json({ success: true, data: result });
};
