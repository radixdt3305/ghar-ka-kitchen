import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { kitchenApi } from "@/api/kitchen.api";
import type { Kitchen, Dish } from "@/types/kitchen.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Copy, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const CATEGORIES = ["breakfast", "lunch", "dinner", "snacks", "dessert", "beverages"];

export function MenuCreate() {
  const navigate = useNavigate();
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dishes, setDishes] = useState<Omit<Dish, "_id">[]>([
    {
      name: "",
      description: "",
      category: "lunch",
      price: 0,
      photos: [],
      quantity: 0,
      availableQuantity: 0,
      status: "available",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadKitchen();
  }, []);

  const loadKitchen = async () => {
    try {
      const { data } = await kitchenApi.getMyKitchen();
      if (data.success && data.data) {
        setKitchen(data.data);
      }
    } catch (err) {
      toast.error("Failed to load kitchen");
      navigate("/cook/dashboard");
    }
  };

  const addDish = () => {
    setDishes([
      ...dishes,
      {
        name: "",
        description: "",
        category: "lunch",
        price: 0,
        photos: [],
        quantity: 0,
        availableQuantity: 0,
        status: "available",
      },
    ]);
  };

  const removeDish = (index: number) => {
    setDishes(dishes.filter((_, i) => i !== index));
  };

  const updateDish = (index: number, field: keyof Omit<Dish, "_id">, value: any) => {
    const updated = [...dishes];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "quantity") {
      updated[index].availableQuantity = value;
    }
    setDishes(updated);
  };

  const copyYesterday = async () => {
    if (!kitchen) return;
    try {
      const { data } = await kitchenApi.copyYesterdayMenu(kitchen._id);
      if (data.success) {
        toast.success("Yesterday's menu copied!");
        navigate("/cook/menu-management");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to copy menu");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitchen) return;

    const validDishes = dishes.filter((d) => d.name && d.price > 0 && d.quantity > 0);
    if (validDishes.length === 0) {
      toast.error("Add at least one valid dish");
      return;
    }

    setLoading(true);
    try {
      await kitchenApi.createMenu(kitchen._id, { date, dishes: validDishes });
      toast.success("Menu created successfully!");
      navigate("/cook/menu-management");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to create menu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Create Menu</h1>
          <p className="mt-1 text-gray-500">Add dishes for {kitchen?.name}</p>
        </div>
        <Button variant="outline" onClick={copyYesterday} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Yesterday
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Menu Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {dishes.map((dish, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Dish {index + 1}</CardTitle>
                {dishes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDish(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Dish Name *</label>
                    <Input
                      value={dish.name}
                      onChange={(e) => updateDish(index, "name", e.target.value)}
                      placeholder="e.g., Paneer Butter Masala"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category *</label>
                    <select
                      value={dish.category}
                      onChange={(e) => updateDish(index, "category", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={dish.description}
                    onChange={(e) => updateDish(index, "description", e.target.value)}
                    placeholder="Describe the dish..."
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Price (₹) *</label>
                    <Input
                      type="number"
                      value={dish.price || ""}
                      onChange={(e) => updateDish(index, "price", parseFloat(e.target.value))}
                      placeholder="150"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity *</label>
                    <Input
                      type="number"
                      value={dish.quantity || ""}
                      onChange={(e) => updateDish(index, "quantity", parseInt(e.target.value))}
                      placeholder="20"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Available</label>
                    <Input
                      type="number"
                      value={dish.availableQuantity}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addDish}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Dish
        </Button>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Menu"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/cook/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
