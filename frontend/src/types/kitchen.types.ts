export interface Kitchen {
  _id: string;
  cookId: string;
  name: string;
  description: string;
  photos: string[];
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  cuisines: string[];
  status: "pending" | "approved" | "rejected" | "suspended";
  fssaiLicense?: string;
  rating: number;
  totalRatings: number;
  totalOrders: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKitchenRequest {
  name: string;
  description: string;
  photos?: string[];
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  cuisines: string[];
  fssaiLicense?: string;
}

export interface Menu {
  _id: string;
  kitchenId: string;
  date: string;
  dishes: Dish[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DietType = "veg" | "non_veg" | "vegan" | "egg";

export interface Dish {
  _id: string;
  name: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "snacks" | "dessert" | "beverages";
  dietType: DietType;
  price: number;
  photos: string[];
  quantity: number;
  availableQuantity: number;
  status: "available" | "sold_out" | "unavailable";
}

export interface CreateMenuRequest {
  date: string;
  dishes: Omit<Dish, "_id">[];
}

export interface KitchenWithMenu extends Kitchen {
  menu?: Menu;
  distance?: number;
}

export interface DishWithKitchen {
  dish: Dish;
  kitchen: Kitchen;
  menuId: string;
  distance?: number;
}
