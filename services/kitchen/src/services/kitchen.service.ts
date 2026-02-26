import { kitchenRepository } from "../repository/kitchen.repository.js";
import { AppError } from "../utils/error.util.js";
import { KitchenStatus } from "../constants/enums.js";

export class KitchenService {
  async createKitchen(cookId: string, data: any) {
    const existing = await kitchenRepository.findByCookId(cookId);
    if (existing) {
      throw new AppError("Kitchen already exists for this cook", 409);
    }

    return kitchenRepository.create({ ...data, cookId });
  }

  async getKitchenByCook(cookId: string) {
    const kitchen = await kitchenRepository.findByCookId(cookId);
    if (!kitchen) {
      throw new AppError("Kitchen not found", 404);
    }
    return kitchen;
  }

  async updateKitchen(kitchenId: string, cookId: string, data: any) {
    const kitchen = await kitchenRepository.findById(kitchenId);
    if (!kitchen) {
      throw new AppError("Kitchen not found", 404);
    }
    if (kitchen.cookId !== cookId) {
      throw new AppError("Unauthorized", 403);
    }

    return kitchenRepository.update(kitchenId, data);
  }

  async approveKitchen(kitchenId: string) {
    return kitchenRepository.updateStatus(kitchenId, KitchenStatus.APPROVED);
  }

  async rejectKitchen(kitchenId: string) {
    return kitchenRepository.updateStatus(kitchenId, KitchenStatus.REJECTED);
  }

  async getNearbyKitchens(lng: number, lat: number, maxDistance?: number) {
    return kitchenRepository.findNearby(lng, lat, maxDistance);
  }

  async getAllKitchens(filters: any) {
    return kitchenRepository.findAll(filters);
  }
}

export const kitchenService = new KitchenService();
