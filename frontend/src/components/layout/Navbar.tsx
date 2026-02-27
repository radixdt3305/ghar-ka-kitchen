import { Link, useNavigate } from "react-router";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { ChefHat, Home, User, LogOut, UtensilsCrossed } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isCook = user?.role === "cook";

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
