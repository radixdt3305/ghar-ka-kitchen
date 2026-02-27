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
      status: { $in: [KitchenStatus.APPROVED, KitchenStatus.PENDING] },
      isActive: true,
    });
  }

  async search(params: {
    lng?: number;
    lat?: number;
    maxDistance?: number;
    cuisines?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: string;
  }) {
    const { lng, lat, maxDistance = 5000, cuisines, minRating, sortBy } = params;

    const query: any = {
      status: { $in: [KitchenStatus.APPROVED, KitchenStatus.PENDING] },
      isActive: true,
    };

    if (cuisines && cuisines.length > 0) {
      query.cuisines = { $in: cuisines };
    }

    if (minRating) {
      query.rating = { $gte: minRating };
    }

    // When sorting by distance, use $near (results are pre-sorted by distance)
    if (lng && lat && (!sortBy || sortBy === "distance")) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      };
      return Kitchen.find(query).limit(50);
    }

    // For non-distance sorting with location, use $geoWithin (no implicit sort)
    if (lng && lat) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], maxDistance / 6378100],
        },
      };
    }

    const sortOptions: Record<string, any> = {
      rating: { rating: -1 },
      price: { rating: 1 }, // cheapest kitchens first (no direct price on kitchen, use rating as proxy)
      popularity: { totalOrders: -1 },
    };

    const sort = sortOptions[sortBy || ""] || { createdAt: -1 };
    return Kitchen.find(query).sort(sort).limit(50);
  }

  async findAll(filters: any = {}) {
    return Kitchen.find({ ...filters, isActive: true });
  }
}

export const kitchenRepository = new KitchenRepository();
