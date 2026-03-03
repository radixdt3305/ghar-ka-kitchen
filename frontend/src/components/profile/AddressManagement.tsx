import { useState, useEffect } from "react";
import { userApi, type AddressInput } from "@/api/user.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, Trash2, Plus, Star } from "lucide-react";
import { toast } from "sonner";

interface Address extends AddressInput {
  _id: string;
}

export function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AddressInput>({
    label: "",
    street: "",
    city: "",
    pincode: "",
    lat: 0,
    lng: 0,
    isDefault: false,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const { data } = await userApi.getProfile();
      setAddresses(data.data?.addresses || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.label || !form.street || !form.city || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Pincode must be 6 digits");
      return;
    }

    setSaving(true);
    try {
      // Get user location for lat/lng
      const addressData = { ...form };
      if (!addressData.lat && !addressData.lng && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          addressData.lat = pos.coords.latitude;
          addressData.lng = pos.coords.longitude;
        } catch {
          // Default coordinates if geolocation fails
          addressData.lat = 23.0225;
          addressData.lng = 72.5714;
        }
      }

      const { data } = await userApi.addAddress(addressData);
      setAddresses(data.data?.addresses || []);
      setShowForm(false);
      setForm({ label: "", street: "", city: "", pincode: "", lat: 0, lng: 0, isDefault: false });
      toast.success("Address added successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (addressId: string) => {
    if (!confirm("Remove this address?")) return;
    try {
      const { data } = await userApi.removeAddress(addressId);
      setAddresses(data.data?.addresses || []);
      toast.success("Address removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove address");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const { data } = await userApi.setDefaultAddress(addressId);
      setAddresses(data.data?.addresses || []);
      toast.success("Default address updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update default");
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-500">Loading addresses...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Addresses</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-lg font-medium">New Address</h3>
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                placeholder="e.g. Home, Office, etc."
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div>
              <Label>Street Address</Label>
              <Input
                placeholder="House/Flat no., Street, Area"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <Label>Pincode</Label>
                <Input
                  placeholder="6-digit pincode"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  maxLength={6}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">Set as default address</Label>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAdd} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                {saving ? "Saving..." : "Save Address"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {addresses.length === 0 ? (
        <div className="py-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No addresses saved yet</p>
          <p className="mt-1 text-sm text-gray-400">Add an address to use during checkout</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <Card key={addr._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {addr.street}, {addr.city} - {addr.pincode}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!addr.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(addr._id)}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(addr._id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
