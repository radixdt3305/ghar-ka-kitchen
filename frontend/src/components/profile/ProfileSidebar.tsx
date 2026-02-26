import { useNavigate } from "react-router";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Star,
  Lock,
  LogOut,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export type ProfileSection =
  | "personal-info"
  | "address"
  | "orders"
  | "wishlist"
  | "reviews"
  | "change-password";

interface ProfileSidebarProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
}

const menuItems: {
  icon: typeof User;
  label: string;
  section: ProfileSection;
}[] = [
  { icon: User, label: "Personal Info", section: "personal-info" },
  { icon: MapPin, label: "Address", section: "address" },
  { icon: ShoppingBag, label: "Orders", section: "orders" },
  { icon: Heart, label: "Wishlist", section: "wishlist" },
  { icon: Star, label: "Reviews", section: "reviews" },
  { icon: Lock, label: "Change Password", section: "change-password" },
];

export function ProfileSidebar({
  activeSection,
  onSectionChange,
}: ProfileSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAvatarClick = () => {
    toast.info("Avatar upload coming soon");
  };

  return (
    <div className="w-full shrink-0 overflow-hidden rounded-xl md:w-72">
      {/* Avatar section */}
      <div className="flex flex-col items-center bg-orange-500 px-6 py-8">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-orange-300 text-2xl font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={handleAvatarClick}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-orange-500 shadow-sm transition-colors hover:bg-orange-50"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-white">{user?.name}</h3>
        <p className="text-sm capitalize text-orange-100">{user?.role}</p>
      </div>

      {/* Menu items */}
      <div className="bg-orange-500 pb-2">
        <div className="border-t border-orange-400" />
        <nav className="mt-1 space-y-0.5 px-2">
          {menuItems.map(({ icon: Icon, label, section }) => (
            <button
              key={section}
              onClick={() => onSectionChange(section)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-white transition-colors ${
                activeSection === section
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}
