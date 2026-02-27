import Menu from "../models/menu.model.js";
import { IMenuDocument } from "../interfaces/menu.interface.js";

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
}

export const menuRepository = new MenuRepository();
