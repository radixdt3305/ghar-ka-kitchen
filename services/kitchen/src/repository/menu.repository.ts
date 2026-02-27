import Menu from "../models/menu.model.js";
import Kitchen from "../models/kitchen.model.js";
import { IMenuDocument } from "../interfaces/menu.interface.js";
import { KitchenStatus } from "../constants/enums.js";

export class MenuRepository {
  async create(data: any): Promise<IMenuDocument> {
    const menu = new Menu(data);
    return menu.save();
  }

  async findById(id: string): Promise<IMenuDocument | null> {
    return Menu.findById(id);
  }

  async findByKitchenAndDate(kitchenId: string, date: Date): Promise<IMenuDocument | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Menu.findOne({
      kitchenId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
    });
  }

  async findByKitchen(kitchenId: string): Promise<IMenuDocument[]> {
    return Menu.find({ kitchenId, isActive: true }).sort({ date: -1 });
  }

  async update(id: string, data: any): Promise<IMenuDocument | null> {
    return Menu.findByIdAndUpdate(id, data, { new: true });
  }

  async updateDishStatus(menuId: string, dishId: string, status: string): Promise<IMenuDocument | null> {
    return Menu.findOneAndUpdate(
      { _id: menuId, "dishes._id": dishId },
      { $set: { "dishes.$.status": status } },
      { new: true }
    );
  }

  async copyMenu(sourceMenuId: string, targetDate: Date, kitchenId: string): Promise<IMenuDocument | null> {
    const sourceMenu = await this.findById(sourceMenuId);
    if (!sourceMenu) return null;

    const newMenu = new Menu({
      kitchenId,
      date: targetDate,
      dishes: sourceMenu.dishes.map((dish: any) => ({
        name: dish.name,
        description: dish.description,
        category: dish.category,
        dietType: dish.dietType,
        price: dish.price,
        photos: dish.photos,
        quantity: dish.quantity,
        availableQuantity: dish.quantity,
        status: "available",
      })),
      isActive: true,
    });

    return newMenu.save();
  }

  async findTodayMenus(lng?: number, lat?: number, maxDistance: number = 5000) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const menus = await Menu.find({
      date: { $gte: today, $lt: tomorrow },
      isActive: true,
    }).lean();

    const kitchenIds = menus.map((m) => m.kitchenId);
    const kitchens = await Kitchen.find({
      _id: { $in: kitchenIds },
      status: { $in: [KitchenStatus.APPROVED, KitchenStatus.PENDING] },
      isActive: true,
    });

    return menus.map((menu) => ({
      ...menu,
      kitchen: kitchens.find((k) => String(k._id) === menu.kitchenId),
    }));
  }

  async searchDishes(params: {
    query?: string;
    category?: string;
    dietType?: string;
    minPrice?: number;
    maxPrice?: number;
    lng?: number;
    lat?: number;
    maxDistance?: number;
    sortBy?: string;
  }) {
    const { query, category, dietType, minPrice, maxPrice, sortBy } = params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Use MongoDB text search when query is provided, else normal find
    const menuQuery: any = {
      date: { $gte: today, $lt: tomorrow },
      isActive: true,
    };
    if (query) {
      menuQuery.$text = { $search: query };
    }

    const menus = await Menu.find(menuQuery).lean();

    const results: any[] = [];

    // Pre-fetch all relevant kitchens in one query
    const kitchenIds = [...new Set(menus.map((m) => m.kitchenId))];
    const kitchens = await Kitchen.find({
      _id: { $in: kitchenIds },
      status: { $in: [KitchenStatus.APPROVED, KitchenStatus.PENDING] },
      isActive: true,
    }).lean();
    const kitchenMap = new Map(kitchens.map((k) => [String(k._id), k]));

    for (const menu of menus) {
      const kitchen = kitchenMap.get(menu.kitchenId);
      if (!kitchen) continue;

      for (const dish of menu.dishes) {
        if (dish.status !== "available") continue;
        // If no $text search was used, do in-memory filter
        if (!query || !menuQuery.$text) {
          if (query && !dish.name.toLowerCase().includes(query.toLowerCase()) && !dish.description.toLowerCase().includes(query.toLowerCase())) continue;
        }
        if (category && dish.category !== category) continue;
        if (dietType && (dish as any).dietType !== dietType) continue;
        if (minPrice && dish.price < minPrice) continue;
        if (maxPrice && dish.price > maxPrice) continue;

        results.push({
          dishes: dish,
          kitchen,
          menuId: menu._id,
        });
      }
    }

    // Sort results
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

    const kitchenIds = [...new Set(menus.map((m) => m.kitchenId))];

    const kitchenQuery: any = {
      _id: { $in: kitchenIds },
      status: { $in: [KitchenStatus.APPROVED, KitchenStatus.PENDING] },
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
    const kitchenMap = new Map(kitchens.map((k) => [String(k._id), k]));

    const dishes: any[] = [];
    for (const menu of menus) {
      const kitchen = kitchenMap.get(menu.kitchenId);
      if (!kitchen) continue;

      for (const dish of menu.dishes) {
        if (dish.status !== "available") continue;
        // Trending score = units sold + kitchen popularity
        const sold = dish.quantity - dish.availableQuantity;
        dishes.push({
          dishes: dish,
          kitchen,
          menuId: menu._id,
          trendingScore: sold + (kitchen.totalOrders || 0),
        });
      }
    }

    dishes.sort((a, b) => b.trendingScore - a.trendingScore);
    return dishes.slice(0, limit);
  }
}

export const menuRepository = new MenuRepository();
