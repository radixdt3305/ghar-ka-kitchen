import { Link, useNavigate } from "react-router";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { ChefHat, Home, User, LogOut, UtensilsCrossed, ShoppingCart, Package, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { cartApi } from "@/api/cart.api";
import { notificationApi } from "@/api/notification.api";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const isCook = user?.role === "cook";

  useEffect(() => {
    if (!isCook) {
      loadCartCount();
    }
    loadUnreadCount();
    // Poll unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isCook]);

  const loadCartCount = async () => {
    try {
      const { data } = await cartApi.getCart();
      setCartCount(data.items?.length || 0);
    } catch {
      setCartCount(0);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  };

  // Expose refresh function globally
  useEffect(() => {
    if (!isCook) {
      (window as any).refreshCartCount = loadCartCount;
    }
    (window as any).refreshUnreadCount = loadUnreadCount;
  }, [isCook]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to={isCook ? "/cook/dashboard" : "/"} className="flex items-center gap-2">
          <ChefHat className="h-7 w-7 text-orange-500" />
          <span className="text-xl font-bold text-orange-500">
            Ghar Ka Kitchen
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link to={isCook ? "/cook/dashboard" : "/"}>
            <Button variant="ghost" size="sm" className="gap-2">
              {isCook ? <UtensilsCrossed className="h-4 w-4" /> : <Home className="h-4 w-4" />}
              <span className="hidden sm:inline">{isCook ? "Dashboard" : "Home"}</span>
            </Button>
          </Link>

          {isCook && (
            <Link to="/cook/orders">
              <Button variant="ghost" size="sm" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </Button>
            </Link>
          )}

          {!isCook && (
            <>
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="gap-2 relative">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                  <span className="hidden sm:inline">Cart</span>
                </Button>
              </Link>
              <Link to="/orders">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Orders</span>
                </Button>
              </Link>
            </>
          )}

          {/* Notification Bell */}
          <Link to="/notifications">
            <Button variant="ghost" size="sm" className="gap-2 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="hidden sm:inline">Alerts</span>
            </Button>
          </Link>

          <Link to="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <span className="hidden text-sm text-gray-600 md:inline">
            {user?.name}
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
