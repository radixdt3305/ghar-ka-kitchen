import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/providers/AuthProvider";
import { kitchenApi } from "@/api/kitchen.api";
import type { Kitchen } from "@/types/kitchen.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export function CookDashboard() {
  const { user } = useAuth();
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
        toast.error("Failed to load kitchen");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!kitchen) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ChefHat className="mx-auto h-16 w-16 text-orange-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Welcome to Cook Dashboard
        </h2>
        <p className="mt-2 text-gray-600">
          You haven't registered your kitchen yet. Let's get started!
        </p>
        <Link to="/cook/kitchen-setup">
          <Button className="mt-6 bg-orange-500 hover:bg-orange-600">
            Register Your Kitchen
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      suspended: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-500">Manage your kitchen and menus</p>
      </div>

      {/* Kitchen Status Alert */}
      {kitchen.status === "pending" && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Kitchen Pending Approval
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your kitchen is under review. You'll be notified once it's
                approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {kitchen.status === "rejected" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Kitchen Rejected
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Your kitchen application was rejected. Please contact support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kitchen Info Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{kitchen.name}</CardTitle>
            <p className="mt-1 text-sm text-gray-500">{kitchen.description}</p>
          </div>
          {getStatusBadge(kitchen.status)}
        </CardHeader>
        <CardContent>
          {kitchen.photos && kitchen.photos.length > 0 && (
            <div className="mb-4">
              <img
                src={kitchen.photos[0]}
                alt={kitchen.name}
                className="h-48 w-full rounded-lg object-cover"
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Cuisines</p>
              <p className="mt-1 text-sm text-gray-900">
                {kitchen.cuisines.join(", ")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="mt-1 text-sm text-gray-900">
                {kitchen.address.city}, {kitchen.address.state}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">FSSAI</p>
              <p className="mt-1 text-sm text-gray-900">
                {kitchen.fssaiLicense || "Not provided"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/cook/kitchen-setup">
              <Button variant="outline" size="sm">
                Edit Kitchen
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {kitchen.status === "approved" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/cook/menu-create">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-lg">Create Today's Menu</CardTitle>
                <p className="text-sm text-gray-500">
                  Add dishes for today's orders
                </p>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/cook/menu-management">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-lg">Manage Menus</CardTitle>
                <p className="text-sm text-gray-500">
                  View and edit your menus
                </p>
              </CardHeader>
            </Card>
          </Link>

          <Card className="cursor-pointer transition-shadow hover:shadow-md opacity-50">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                <ChefHat className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle className="text-lg">Orders</CardTitle>
              <p className="text-sm text-gray-500">Coming soon</p>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  );
}
