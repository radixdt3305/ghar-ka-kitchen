import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { kitchenApi } from "@/api/kitchen.api";
import type { Kitchen, Menu } from "@/types/kitchen.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function MenuManagement() {
  const navigate = useNavigate();
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: kitchenData } = await kitchenApi.getMyKitchen();
      if (kitchenData.success && kitchenData.data) {
        setKitchen(kitchenData.data);
        const { data: menusData } = await kitchenApi.getMenus(kitchenData.data._id);
        if (menusData.success && menusData.data) {
          setMenus(menusData.data);
        }
      }
    } catch (err) {
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  const toggleDishStatus = async (menuId: string, dishId: string, currentStatus: string) => {
    const newStatus = currentStatus === "available" ? "sold_out" : "available";
    try {
      await kitchenApi.toggleDishStatus(menuId, dishId, newStatus);
      toast.success(`Dish marked as ${newStatus.replace("_", " ")}`);
      loadData();
    } catch (err) {
      toast.error("Failed to update dish status");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/cook/dashboard")}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-1 text-gray-500">Manage your daily menus</p>
        </div>
        <Link to="/cook/menu-create">
          <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Create Menu
          </Button>
        </Link>
      </div>

      {menus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No menus yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first menu to start receiving orders
            </p>
            <Link to="/cook/menu-create">
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                Create Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {menus.map((menu) => (
            <Card key={menu._id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{formatDate(menu.date)}</CardTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    {menu.dishes.length} dish{menu.dishes.length !== 1 ? "es" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {menu.dishes.map((dish) => (
                    <div
                      key={dish._id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex flex-1 gap-4">
                        {dish.photos && dish.photos.length > 0 && (
                          <img
                            src={dish.photos[0]}
                            alt={dish.name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-gray-900">{dish.name}</h4>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {dish.category}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                dish.status === "available"
                                  ? "bg-green-100 text-green-700"
                                  : dish.status === "sold_out"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {dish.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{dish.description}</p>
                          <div className="mt-2 flex gap-4 text-sm text-gray-600">
                            <span>₹{dish.price}</span>
                            <span>•</span>
                            <span>
                              {dish.availableQuantity}/{dish.quantity} available
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDishStatus(menu._id, dish._id, dish.status)}
                        className={
                          dish.status === "available"
                            ? "border-red-300 text-red-600 hover:bg-red-50"
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        }
                      >
                        {dish.status === "available" ? "Mark Sold Out" : "Mark Available"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
