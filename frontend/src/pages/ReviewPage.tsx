import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { orderApi, type Order, OrderStatus } from "../api/order.api";
import { reviewApi } from "../api/review.api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, Star, Upload, X } from "lucide-react";
import { toast } from "sonner";

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-gray-600">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hovered || value) ? "fill-orange-400 text-orange-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500">{value > 0 ? `${value}/5` : ""}</span>
    </div>
  );
}

export default function ReviewPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [taste, setTaste] = useState(0);
  const [portion, setPortion] = useState(0);
  const [hygiene, setHygiene] = useState(0);
  const [dishRatings, setDishRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data } = await orderApi.getOrderById(orderId!);
      if (data.status !== OrderStatus.DELIVERED) {
        toast.error("You can only review delivered orders");
        navigate("/orders");
        return;
      }
      setOrder(data);
      const initial: Record<string, number> = {};
      data.items.forEach((item: any) => { initial[item.dishId] = 0; });
      setDishRatings(initial);
    } catch {
      toast.error("Order not found");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }
    const newPhotos = [...photos, ...files].slice(0, 5);
    setPhotos(newPhotos);
    const previews = newPhotos.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (idx: number) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    const newPreviews = photoPreviews.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (taste === 0 || portion === 0 || hygiene === 0) {
      toast.error("Please rate all three dimensions: Taste, Portion, and Hygiene");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    if (!order) return;

    setSubmitting(true);
    try {
      const review = await reviewApi.createReview({
        orderId: order.orderId,
        kitchenId: order.kitchenId,
        cookId: order.kitchenId,
        rating: { taste, portion, hygiene },
        dishRatings: order.items.map((item: any) => ({
          dishId: item.dishId,
          name: item.name,
          rating: dishRatings[item.dishId] || 0,
        })),
        comment,
      });

      if (photos.length > 0) {
        try {
          await reviewApi.uploadPhotos(review._id, photos);
        } catch {
          toast.warning("Review submitted but photo upload failed");
        }
      }

      toast.success("Review submitted successfully!");
      navigate("/orders");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/orders")}>← Back</Button>
        <h1 className="text-2xl font-bold">Write a Review</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-600">Order #{order.orderId}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {order.items.map((item: any, idx: number) => (
            <p key={idx} className="text-sm">{item.name} × {item.quantity}</p>
          ))}
        </CardContent>
      </Card>

      {/* Overall Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Your Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StarRating value={taste} onChange={setTaste} label="Taste" />
          <StarRating value={portion} onChange={setPortion} label="Portion" />
          <StarRating value={hygiene} onChange={setHygiene} label="Hygiene" />
        </CardContent>
      </Card>

      {/* Dish-level Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Individual Dishes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item: any) => (
            <StarRating
              key={item.dishId}
              value={dishRatings[item.dishId] || 0}
              onChange={(v) => setDishRatings((prev) => ({ ...prev, [item.dishId]: v }))}
              label={item.name.length > 12 ? item.name.slice(0, 12) + "…" : item.name}
            />
          ))}
        </CardContent>
      </Card>

      {/* Comment */}
      <Card>
        <CardHeader>
          <CardTitle>Your Review</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            rows={4}
            maxLength={1000}
            placeholder="Share your experience with this kitchen..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>
        </CardContent>
      </Card>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Add Photos (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-3">
            {photoPreviews.map((src, idx) => (
              <div key={idx} className="relative">
                <img src={src} className="w-20 h-20 object-cover rounded-lg border" alt="" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Add</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handlePhotoSelect} />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">Up to 5 photos (JPEG, PNG, WebP, max 5MB each)</p>
        </CardContent>
      </Card>

      <Button
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Review"}
      </Button>
    </div>
  );
}
