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

export interface Dish {
  _id: string;
  name: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "snacks" | "dessert" | "beverages";
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
