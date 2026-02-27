import { Request, Response } from "express";
import { kitchenService } from "../services/kitchen.service.js";
import { sendSuccess } from "../utils/response.util.js";

export const createKitchen = async (req: Request, res: Response) => {
  const cookId = req.userId!;
  const result = await kitchenService.createKitchen(cookId, req.body);
  sendSuccess(res, 201, "Kitchen created successfully", result);
};

export const getMyKitchen = async (req: Request, res: Response) => {
  const cookId = req.userId!;
  const result = await kitchenService.getKitchenByCook(cookId);
  sendSuccess(res, 200, "Kitchen retrieved", result);
};

export const updateKitchen = async (req: Request, res: Response) => {
  const cookId = req.userId!;
  const { kitchenId } = req.params;
  const result = await kitchenService.updateKitchen(kitchenId as string, cookId, req.body);
  sendSuccess(res, 200, "Kitchen updated", result);
};

export const approveKitchen = async (req: Request, res: Response) => {
  const { kitchenId } = req.params;
  const result = await kitchenService.approveKitchen(kitchenId as string);
  sendSuccess(res, 200, "Kitchen approved", result);
};

export const rejectKitchen = async (req: Request, res: Response) => {
  const { kitchenId } = req.params;
  const result = await kitchenService.rejectKitchen(kitchenId as string);
  sendSuccess(res, 200, "Kitchen rejected", result);
};

export const getNearbyKitchens = async (req: Request, res: Response) => {
  const { lng, lat, maxDistance } = req.query;
  const result = await kitchenService.getNearbyKitchens(
    Number(lng),
    Number(lat),
    maxDistance ? Number(maxDistance) : undefined
  );
  sendSuccess(res, 200, "Nearby kitchens retrieved", result);
};

export const searchKitchens = async (req: Request, res: Response) => {
  const result = await kitchenService.searchKitchens(req.query);
  sendSuccess(res, 200, "Kitchens retrieved", result);
};

export const getKitchenById = async (req: Request, res: Response) => {
  const { kitchenId } = req.params;
  const result = await kitchenService.getKitchenById(kitchenId);
  sendSuccess(res, 200, "Kitchen retrieved", result);
};
