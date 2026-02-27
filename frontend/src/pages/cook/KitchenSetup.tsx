import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { kitchenApi } from "@/api/kitchen.api";
import type { Kitchen, CreateKitchenRequest } from "@/types/kitchen.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const CUISINES = [
  "north_indian", "south_indian", "chinese", "continental", "italian",
  "mexican", "bengali", "gujarati", "punjabi", "maharashtrian",
  "rajasthani", "street_food", "desserts", "bakery"
];

export function KitchenSetup() {
  const navigate = useNavigate();
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const form = useForm<CreateKitchenRequest>({
    defaultValues: {
      name: "",
      description: "",
      photos: [],
      address: { street: "", city: "", state: "", pincode: "" },
      location: { type: "Point", coordinates: [0, 0] },
      cuisines: [],
      fssaiLicense: "",
    },
  });

  useEffect(() => {
    loadKitchen();
  }, []);

  const loadKitchen = async () => {
    try {
      const { data } = await kitchenApi.getMyKitchen();
      if (data.success && data.data) {
        setKitchen(data.data);
        form.reset({
          name: data.data.name,
          description: data.data.description,
          photos: data.data.photos || [],
          address: data.data.address,
          location: data.data.location,
          cuisines: data.data.cuisines,
          fssaiLicense: data.data.fssaiLicense || "",
        });
        setSelectedCuisines(data.data.cuisines);
      }
    } catch (err) {
      // Kitchen doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  const setLocationCoords = (latitude: number, longitude: number) => {
    form.setValue("location.coordinates.0", longitude);
    form.setValue("location.coordinates.1", latitude);
    toast.success(`Location detected! (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
  };

  const fallbackToIpLocation = async () => {
    try {
      const res = await axios.get("https://ipapi.co/json/");
      const { latitude, longitude } = res.data;
      if (latitude && longitude) {
        setLocationCoords(latitude, longitude);
        return;
      }
      throw new Error("No coordinates in response");
    } catch {
      toast.error("Could not detect location. Please enter coordinates manually.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    toast.info("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords(position.coords.latitude, position.coords.longitude);
        setDetectingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Please allow location access in your browser settings.");
          setDetectingLocation(false);
          return;
        }
        // Timeout or position unavailable — fall back to IP geolocation
        toast.info("Browser location unavailable, trying IP-based detection...");
        fallbackToIpLocation();
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const onSubmit = async (values: CreateKitchenRequest) => {
    try {
      const payload = { ...values, cuisines: selectedCuisines };

      if (kitchen) {
        await kitchenApi.updateKitchen(kitchen._id, payload);
        toast.success("Kitchen updated successfully");
      } else {
        await kitchenApi.createKitchen(payload);
        toast.success("Kitchen registered successfully");
      }
      navigate("/cook/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to save kitchen");
      }
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/cook/dashboard")}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {kitchen ? "Edit Kitchen" : "Register Your Kitchen"}
          </CardTitle>
          <p className="text-sm text-gray-500">
            Fill in your kitchen details to start selling
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kitchen Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sharma's Kitchen" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell customers about your kitchen..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kitchen Photos</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || []}
                        onChange={field.onChange}
                        maxImages={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Address *</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="6-digit pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Location (Coordinates) *</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    className="gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    {detectingLocation ? "Detecting..." : "Detect My Location"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location.coordinates.0"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="77.2090"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location.coordinates.1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="28.6139"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Click "Detect My Location" to auto-fill coordinates, or enter manually
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Cuisines *</h3>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {CUISINES.map((cuisine) => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleCuisine(cuisine)}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selectedCuisines.includes(cuisine)
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {cuisine.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="fssaiLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FSSAI License (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="FSSAI License Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={form.formState.isSubmitting || selectedCuisines.length === 0}
                >
                  {form.formState.isSubmitting ? "Saving..." : kitchen ? "Update Kitchen" : "Register Kitchen"}
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
