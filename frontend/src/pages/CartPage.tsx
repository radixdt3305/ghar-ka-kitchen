import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { cartApi, type Cart as CartType } from "../api/cart.api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const { data } = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (dishId: string, newQuantity: number) => {
    try {
      const { data } = await cartApi.updateItem(dishId, newQuantity);
      setCart(data);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to update quantity");
    }
  };

  const removeItem = async (dishId: string) => {
    try {
      const { data } = await cartApi.removeItem(dishId);
      setCart(data);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to remove item");
    }
  };

  const clearCart = async () => {
    if (!confirm("Clear all items from cart?")) return;
    try {
      await cartApi.clearCart();
      setCart(null);
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to clear cart");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <ShoppingCart className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some delicious dishes to get started!</p>
        <Button onClick={() => navigate("/discover")}>Browse Dishes</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
      </div>

      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <Card key={item.dishId} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600">₹{item.price}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="font-semibold min-w-[80px] text-right">
                  ₹{item.price * item.quantity}
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeItem(item.dishId)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total Amount:</span>
          <span className="text-2xl font-bold">₹{cart.totalAmount}</span>
        </div>
        <Button className="w-full" size="lg" onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </Button>
      </Card>
    </div>
  );
}
