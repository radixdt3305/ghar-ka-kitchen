import mongoose from "mongoose";

const kitchenSchema = new mongoose.Schema({
  cookId: String,
  name: String,
  description: String,
  photos: [String],
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number],
  },
  cuisines: [String],
  status: String,
  fssaiLicense: String,
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  isActive: Boolean,
}, { timestamps: true });

kitchenSchema.index({ location: "2dsphere" });

const menuSchema = new mongoose.Schema({
  kitchenId: String,
  date: Date,
  dishes: [{
    name: String,
    description: String,
    category: String,
    dietType: { type: String, default: "veg" },
    price: Number,
    photos: [String],
    quantity: Number,
    availableQuantity: Number,
    status: String,
  }],
  isActive: Boolean,
}, { timestamps: true });

menuSchema.index({ "dishes.name": "text", "dishes.description": "text" });

const Kitchen = mongoose.models.Kitchen || mongoose.model("Kitchen", kitchenSchema);
const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);

export class SearchService {
  async searchKitchens(filters: any) {
    const { lng, lat, maxDistance = 5000, cuisines, minRating, sortBy } = filters;

    const query: any = {
      status: { $in: ["approved", "pending"] },
      isActive: true,
    };

    if (cuisines && cuisines.length > 0) {
      query.cuisines = { $in: cuisines.split(",") };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (lng && lat && (!sortBy || sortBy === "distance")) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistance),
        },
      };
      return Kitchen.find(query).limit(50);
    }

    if (lng && lat) {
      query.location = {
        $geoWithin: {
          $centerSphere: [[Number(lng), Number(lat)], Number(maxDistance) / 6378100],
        },
      };
    }

    const sortOptions: Record<string, any> = {
      rating: { rating: -1 },
      popularity: { totalOrders: -1 },
    };
    const sort = sortOptions[sortBy || ""] || { createdAt: -1 };
    return Kitchen.find(query).sort(sort).limit(50);
  }

  async getNearbyKitchens(lng: number, lat: number, maxDistance: number = 5000) {
    return Kitchen.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
      status: { $in: ["approved", "pending"] },
      isActive: true,
    });
  }

  async getTodayMenus(lng?: number, lat?: number, maxDistance: number = 5000) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const menus = await Menu.find({
      date: { $gte: today, $lt: tomorrow },
      isActive: true,
    }).lean();

    const kitchenIds = menus.map((m: any) => m.kitchenId);
    const kitchens = await Kitchen.find({
      _id: { $in: kitchenIds },
      status: { $in: ["approved", "pending"] },
      isActive: true,
    });

    return menus.map((menu: any) => ({
      ...menu,
      kitchen: kitchens.find((k: any) => String(k._id) === menu.kitchenId),
    }));
  }

  async searchDishes(filters: any) {
    const { query, category, dietType, minPrice, maxPrice, sortBy } = filters;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const menuQuery: any = {
      date: { $gte: today, $lt: tomorrow },
      isActive: true,
    };
    if (query) {
      menuQuery.$text = { $search: query };
    }

    const menus = await Menu.find(menuQuery).lean();

    const kitchenIds = [...new Set(menus.map((m: any) => m.kitchenId))];
    const kitchens = await Kitchen.find({
      _id: { $in: kitchenIds },
      status: { $in: ["approved", "pending"] },
      isActive: true,
    }).lean();
    const kitchenMap = new Map(kitchens.map((k: any) => [String(k._id), k]));

    const results: any[] = [];

    for (const menu of menus) {
      const kitchen = kitchenMap.get((menu as any).kitchenId);
      if (!kitchen) continue;

      for (const dish of (menu as any).dishes) {
        if (dish.status !== "available") continue;
        if (!query || !menuQuery.$text) {
          if (query && !dish.name.toLowerCase().includes(query.toLowerCase()) && !dish.description.toLowerCase().includes(query.toLowerCase())) continue;
        }
        if (category && dish.category !== category) continue;
        if (dietType && dish.dietType !== dietType) continue;
        if (minPrice && dish.price < Number(minPrice)) continue;
        if (maxPrice && dish.price > Number(maxPrice)) continue;

        results.push({
          dishes: dish,
          kitchen,
          menuId: (menu as any)._id,
        });
      }
    }

    if (sortBy === "price_low") {
      results.sort((a, b) => a.dishes.price - b.dishes.price);
    } else if (sortBy === "price_high") {
      results.sort((a, b) => b.dishes.price - a.dishes.price);
    } else if (sortBy === "rating") {
      results.sort((a, b) => (b.kitchen.rating || 0) - (a.kitchen.rating || 0));
    } else if (sortBy === "popularity") {
      results.sort((a, b) => (b.kitchen.totalOrders || 0) - (a.kitchen.totalOrders || 0));
    }

    return results;
  }

  async getTrendingDishes(lng?: number, lat?: number, maxDistance: number = 5000, limit: number = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const menus = await Menu.find({
      date: { $gte: today, $lt: tomorrow },
      isActive: true,
    }).lean();

    const kitchenIds = [...new Set(menus.map((m: any) => m.kitchenId))];
    const kitchenQuery: any = {
      _id: { $in: kitchenIds },
      status: { $in: ["approved", "pending"] },
      isActive: true,
    };

    if (lng && lat) {
      kitchenQuery.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], maxDistance / 6378100],
        },
      };
    }

    const kitchens = await Kitchen.find(kitchenQuery).lean();
    const kitchenMap = new Map(kitchens.map((k: any) => [String(k._id), k]));

    const dishes: any[] = [];
    for (const menu of menus) {
      const kitchen = kitchenMap.get((menu as any).kitchenId);
      if (!kitchen) continue;

      for (const dish of (menu as any).dishes) {
        if (dish.status !== "available") continue;
        const sold = dish.quantity - dish.availableQuantity;
        dishes.push({
          dishes: dish,
          kitchen,
          menuId: (menu as any)._id,
          trendingScore: sold + ((kitchen as any).totalOrders || 0),
        });
      }
    }

    dishes.sort((a, b) => b.trendingScore - a.trendingScore);
    return dishes.slice(0, limit);
  }
}

export const searchService = new SearchService();
