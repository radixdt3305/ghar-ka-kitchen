import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { kitchenApi } from "@/api/kitchen.api";
import { cartApi } from "@/api/cart.api";
import type { Kitchen } from "@/types/kitchen.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Star, ShoppingCart, Clock } from "lucide-react";
import { toast } from "sonner";

function DietBadge({ dietType }: { dietType?: string }) {
  const isVeg = !dietType || dietType === "veg" || dietType === "vegan";
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
        isVeg ? "border-green-600" : "border-red-600"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`} />
    </span>
  );
}

const CATEGORY_ORDER = ["breakfast", "lunch", "dinner", "snacks", "dessert", "beverages"];

export default function KitchenDetailPage() {
  const { kitchenId } = useParams<{ kitchenId: string }>();
  const navigate = useNavigate();
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (kitchenId) loadData();
  }, [kitchenId]);

  const loadData = async () => {
    try {
      const [kitchenRes, menuRes] = await Promise.all([
        kitchenApi.getKitchenById(kitchenId!),
        kitchenApi.getTodayMenuByKitchen(kitchenId!).catch(() => null),
      ]);
      if (kitchenRes.data.success) {
        setKitchen(kitchenRes.data.data);
      }
      if (menuRes?.data?.success) {
        setMenu(menuRes.data.data);
      }
    } catch (error) {
      console.error("Failed to load kitchen:", error);
      toast.error("Failed to load kitchen details");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (dishId: string, dishName: string) => {
    setAddingToCart(dishId);
    try {
      await cartApi.addToCart(kitchenId!, dishId, 1);
      toast.success(`${dishName} added to cart!`);
    } catch (error: any) {
      const msg = error.response?.data?.error || "Failed to add to cart";
      if (msg.includes("one kitchen")) {
        toast.error("Your cart has items from another kitchen. Clear cart first.");
      } else {
        toast.error(msg);
      }
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!kitchen) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Kitchen not found</p>
        <Button onClick={() => navigate("/discover")} className="mt-4">Back to Discover</Button>
      </div>
    );
  }

  // Group dishes by category
  const dishesByCategory: Record<string, any[]> = {};
  if (menu?.dishes) {
    for (const dish of menu.dishes) {
      const cat = dish.category || "other";
      if (!dishesByCategory[cat]) dishesByCategory[cat] = [];
      dishesByCategory[cat].push(dish);
    }
  }

  const sortedCategories = Object.keys(dishesByCategory).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Kitchen Header */}
      <Card className="mb-8 overflow-hidden">
        {kitchen.photos && kitchen.photos.length > 0 && (
          <img src={kitchen.photos[0]} alt={kitchen.name} className="h-56 w-full object-cover" />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{kitchen.name}</h1>
              <p className="mt-1 text-gray-600">{kitchen.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">
                {kitchen.rating > 0 ? kitchen.rating.toFixed(1) : "New"}
              </span>
              {kitchen.totalRatings > 0 && (
                <span className="text-sm text-gray-400">({kitchen.totalRatings})</span>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {kitchen.address.street}, {kitchen.address.city}
            </div>
            {kitchen.totalOrders > 0 && (
              <span>{kitchen.totalOrders} orders</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {kitchen.cuisines.map((c) => (
              <span key={c} className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700">
                {c.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Today's Menu */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Today's Menu</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
        </div>
      </div>

      {!menu || !menu.dishes || menu.dishes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No menu available for today</p>
          <p className="mt-1 text-sm text-gray-400">Check back later for today's dishes</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h3 className="mb-3 text-lg font-semibold capitalize text-gray-800">
                {category}
              </h3>
              <div className="space-y-3">
                {dishesByCategory[category].map((dish: any) => {
                  const isAvailable = dish.status === "available" && dish.availableQuantity > 0;
                  return (
                    <Card key={dish._id} className={`p-4 ${!isAvailable ? "opacity-60" : ""}`}>
                      <div className="flex gap-4">
                        {dish.photos && dish.photos.length > 0 && (
                          <img
                            src={dish.photos[0]}
                            alt={dish.name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <DietBadge dietType={dish.dietType} />
                            <h4 className="font-semibold">{dish.name}</h4>
                          </div>
                          {dish.description && (
                            <p className="mt-1 text-sm text-gray-500">{dish.description}</p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-orange-600">
                                ₹{dish.price}
                              </span>
                              {isAvailable && (
                                <span className="text-xs text-gray-400">
                                  {dish.availableQuantity} left
                                </span>
                              )}
                            </div>
                            {isAvailable ? (
                              <Button
                                size="sm"
                                className="gap-2 bg-orange-500 hover:bg-orange-600"
                                onClick={() => addToCart(dish._id, dish.name)}
                                disabled={addingToCart === dish._id}
                              >
                                <ShoppingCart className="h-4 w-4" />
                                {addingToCart === dish._id ? "Adding..." : "Add"}
                              </Button>
                            ) : (
                              <span className="text-sm font-medium text-red-500">
                                {dish.status === "sold_out" ? "Sold Out" : "Unavailable"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
