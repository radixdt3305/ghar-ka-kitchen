import { Link } from "react-router";
import { useAuth } from "@/providers/AuthProvider";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UtensilsCrossed, ShoppingBag, User, Heart } from "lucide-react";

const quickActions = [
  {
    icon: UtensilsCrossed,
    title: "Browse Menu",
    description: "Explore home-cooked meals near you",
    to: "/",
    comingSoon: true,
  },
  {
    icon: ShoppingBag,
    title: "My Orders",
    description: "Track your current and past orders",
    to: "/",
    comingSoon: true,
  },
  {
    icon: User,
    title: "My Profile",
    description: "View and edit your personal info",
    to: "/profile",
    comingSoon: false,
  },
  {
    icon: Heart,
    title: "Favorites",
    description: "Your saved dishes and kitchens",
    to: "/",
    comingSoon: true,
  },
];

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-500">
          What would you like to eat today?
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(
          ({ icon: Icon, title, description, to, comingSoon }) => (
            <Link
              key={title}
              to={to}
              className={comingSoon ? "pointer-events-none" : ""}
            >
              <Card className="relative h-full cursor-pointer transition-shadow hover:shadow-md">
                {comingSoon && (
                  <span className="absolute top-3 right-3 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                    Soon
                  </span>
                )}
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                    <Icon className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
