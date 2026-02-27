import { useState, useEffect, useRef } from "react";
import { kitchenApi } from "@/api/kitchen.api";
import type { Kitchen } from "@/types/kitchen.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter, Star, TrendingUp, Map, List, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const CUISINES = [
  "north_indian", "south_indian", "chinese", "continental", "italian",
  "mexican", "bengali", "gujarati", "punjabi", "maharashtrian",
  "rajasthani", "street_food", "desserts", "bakery"
];

const CATEGORIES = ["breakfast", "lunch", "dinner", "snacks", "dessert", "beverages"];
const DIET_TYPES = [
  { value: "veg", label: "Veg", color: "text-green-700 bg-green-50 border-green-500" },
  { value: "non_veg", label: "Non-Veg", color: "text-red-700 bg-red-50 border-red-500" },
  { value: "vegan", label: "Vegan", color: "text-emerald-700 bg-emerald-50 border-emerald-500" },
  { value: "egg", label: "Egg", color: "text-yellow-700 bg-yellow-50 border-yellow-500" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "distance", label: "Distance" },
  { value: "rating", label: "Rating" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "popularity", label: "Popularity" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
];

function DietBadge({ dietType }: { dietType?: string }) {
  const isVeg = !dietType || dietType === "veg" || dietType === "vegan";
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
        isVeg ? "border-green-600" : "border-red-600"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`}
      />
    </span>
  );
}

function StarRating({ rating, totalRatings }: { rating: number; totalRatings: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-medium">{rating > 0 ? rating.toFixed(1) : "New"}</span>
      {totalRatings > 0 && (
        <span className="text-xs text-gray-400">({totalRatings})</span>
      )}
    </div>
  );
}

export function DiscoveryPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<{ lng: number; lat: number } | null>(null);
  const [filters, setFilters] = useState({
    cuisines: [] as string[],
    category: "",
    dietType: "",
    minPrice: "",
    maxPrice: "",
    maxDistance: "5000",
    minRating: "",
    sortBy: "",
  });
  const [viewMode, setViewMode] = useState<"kitchens" | "dishes">("kitchens");
  const [displayMode, setDisplayMode] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    detectLocation();
    loadData();
    loadTrending();
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      loadData();
    }
    initialLoadDone.current = true;
  }, [location, viewMode]);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            toast.error("Location access denied. Showing all results.");
          } else {
            toast.info("Could not detect location. Showing all results.");
          }
        },
        { timeout: 15000, enableHighAccuracy: false }
      );
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (viewMode === "kitchens") {
        const params: any = {};
        if (location) {
          params.lng = location.lng;
          params.lat = location.lat;
          params.maxDistance = filters.maxDistance;
        }
        if (filters.cuisines.length > 0) {
          params.cuisines = filters.cuisines.join(",");
        }
        if (filters.minRating) {
          params.minRating = filters.minRating;
        }
        if (filters.sortBy) {
          params.sortBy = filters.sortBy;
        }
        const { data } = await kitchenApi.searchKitchens(params);
        if (data.success) {
          setKitchens(data.data || []);
        }
      } else {
        const params: any = {};
        if (searchQuery) params.query = searchQuery;
        if (filters.category) params.category = filters.category;
        if (filters.dietType) params.dietType = filters.dietType;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (location) {
          params.lng = location.lng;
          params.lat = location.lat;
          params.maxDistance = filters.maxDistance;
        }
        const { data } = await kitchenApi.searchDishes(params);
        if (data.success) {
          setDishes(data.data || []);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    try {
      const params: any = {};
      if (location) {
        params.lng = location.lng;
        params.lat = location.lat;
        params.maxDistance = filters.maxDistance;
      }
      params.limit = 6;
      const { data } = await kitchenApi.getTrendingDishes(params);
      if (data.success) {
        setTrending(data.data || []);
      }
    } catch {
      // Trending is non-critical, silently fail
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const toggleCuisine = (cuisine: string) => {
    setFilters((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }));
  };

  const defaultCenter: [number, number] = location
    ? [location.lat, location.lng]
    : [23.0225, 72.5714]; // Ahmedabad fallback

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Discover Food</h1>
        <p className="mt-2 text-gray-500">Find home-cooked meals near you</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600">
          Search
        </Button>
      </div>

      {/* View Toggle + Display Mode */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "kitchens" ? "default" : "outline"}
            onClick={() => setViewMode("kitchens")}
            className={viewMode === "kitchens" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            Kitchens
          </Button>
          <Button
            variant={viewMode === "dishes" ? "default" : "outline"}
            onClick={() => setViewMode("dishes")}
            className={viewMode === "dishes" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            Dishes
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {viewMode === "kitchens" && (
            <>
              <Button
                variant={displayMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("list")}
                className={displayMode === "list" ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("map")}
                className={displayMode === "map" ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                <Map className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Sort Bar */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => {
            setFilters({ ...filters, sortBy: e.target.value });
            // Trigger reload on sort change
            setTimeout(() => loadData(), 0);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="space-y-4 pt-6">
            {viewMode === "kitchens" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium">Cuisines</label>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                    {CUISINES.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => toggleCuisine(cuisine)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          filters.cuisines.includes(cuisine)
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {cuisine.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    {RATING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {viewMode === "dishes" && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Diet Type</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilters({ ...filters, dietType: "" })}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        !filters.dietType
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      All
                    </button>
                    {DIET_TYPES.map((dt) => (
                      <button
                        key={dt.value}
                        onClick={() => setFilters({ ...filters, dietType: dt.value })}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          filters.dietType === dt.value
                            ? dt.color
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {dt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Min Price</label>
                <Input
                  type="number"
                  placeholder="₹0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Max Price</label>
                <Input
                  type="number"
                  placeholder="₹1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Distance (m)</label>
                <Input
                  type="number"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full bg-orange-500 hover:bg-orange-600">
              Apply Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trending Dishes */}
      {trending.length > 0 && viewMode === "dishes" && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trending Now
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {trending.map((item, index) => (
              <Card key={index} className="min-w-[250px] flex-shrink-0 cursor-pointer transition-shadow hover:shadow-lg">
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <DietBadge dietType={item.dishes?.dietType} />
                    <h3 className="font-semibold text-gray-900">{item.dishes?.name}</h3>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-gray-500">{item.dishes?.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">₹{item.dishes?.price}</span>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700">
                      {item.dishes?.category}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    From: {item.kitchen?.name}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : viewMode === "kitchens" && displayMode === "map" ? (
        /* Map View */
        <div className="h-[500px] overflow-hidden rounded-lg border">
          <MapContainer
            center={defaultCenter}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {kitchens
              .filter((k) => k.location?.coordinates)
              .map((kitchen) => (
                <Marker
                  key={kitchen._id}
                  position={[
                    kitchen.location.coordinates[1],
                    kitchen.location.coordinates[0],
                  ]}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-semibold">{kitchen.name}</h3>
                      <p className="text-sm text-gray-500">{kitchen.description}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">
                          {kitchen.rating > 0 ? kitchen.rating.toFixed(1) : "New"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {kitchen.address.city}, {kitchen.address.state}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {kitchen.cuisines.slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="rounded bg-orange-100 px-1 py-0.5 text-xs text-orange-700"
                          >
                            {c.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      ) : viewMode === "kitchens" ? (
        /* Kitchen List View */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {kitchens.map((kitchen) => (
            <Card key={kitchen._id} className="cursor-pointer transition-shadow hover:shadow-lg">
              {kitchen.photos && kitchen.photos.length > 0 && (
                <img
                  src={kitchen.photos[0]}
                  alt={kitchen.name}
                  className="h-48 w-full rounded-t-lg object-cover"
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{kitchen.name}</CardTitle>
                  <StarRating rating={kitchen.rating || 0} totalRatings={kitchen.totalRatings || 0} />
                </div>
                <p className="text-sm text-gray-500">{kitchen.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {kitchen.address.city}, {kitchen.address.state}
                  </div>
                  {kitchen.totalOrders > 0 && (
                    <p className="text-xs text-gray-400">{kitchen.totalOrders} orders</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {kitchen.cuisines.slice(0, 3).map((cuisine) => (
                      <span
                        key={cuisine}
                        className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700"
                      >
                        {cuisine.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Dishes View */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {dishes.map((item, index) => (
            <Card key={index} className="cursor-pointer transition-shadow hover:shadow-lg">
              <div className="flex gap-4 p-4">
                {item.dishes?.photos && item.dishes.photos.length > 0 && (
                  <img
                    src={item.dishes.photos[0]}
                    alt={item.dishes.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DietBadge dietType={item.dishes?.dietType} />
                    <h3 className="font-semibold text-gray-900">{item.dishes?.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{item.dishes?.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-orange-600">₹{item.dishes?.price}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {item.dishes?.category}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      From: {item.kitchen?.name}
                    </p>
                    {item.kitchen?.rating > 0 && (
                      <StarRating rating={item.kitchen.rating} totalRatings={item.kitchen.totalRatings} />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && ((viewMode === "kitchens" && kitchens.length === 0) || (viewMode === "dishes" && dishes.length === 0)) && (
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-gray-500">No results found</p>
          <p className="mt-2 text-sm text-gray-400">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
