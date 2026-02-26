import Kitchen from "../models/kitchen.model.js";
import { IKitchenDocument } from "../interfaces/kitchen.interface.js";
import { KitchenStatus } from "../constants/enums.js";

export class KitchenRepository {
  async create(data: any): Promise<IKitchenDocument> {
    const kitchen = new Kitchen(data);
    return kitchen.save();
  }

  async findById(id: string): Promise<IKitchenDocument | null> {
    return Kitchen.findById(id);
  }

  async findByCookId(cookId: string): Promise<IKitchenDocument | null> {
    return Kitchen.findOne({ cookId, isActive: true });
  }

  async update(id: string, data: any): Promise<IKitchenDocument | null> {
    return Kitchen.findByIdAndUpdate(id, data, { new: true });
  }

  async updateStatus(id: string, status: KitchenStatus): Promise<IKitchenDocument | null> {
    return Kitchen.findByIdAndUpdate(id, { status }, { new: true });
  }

  async findNearby(lng: number, lat: number, maxDistance: number = 5000) {
    return Kitchen.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
      status: KitchenStatus.APPROVED,
      isActive: true,
    });
  }

  async findAll(filters: any = {}) {
    return Kitchen.find({ ...filters, isActive: true });
  }
}

export const kitchenRepository = new KitchenRepository();
