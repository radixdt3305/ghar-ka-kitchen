import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { orderApi, type Order, OrderStatus } from "../api/order.api";
import { reviewApi } from "../api/review.api";
import type { Review } from "../types/review.types";
import { useAuth } from "../providers/AuthProvider";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { io, Socket } from "socket.io-client";
import { Check, Star, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const statusSteps = [
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
];

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PLACED]: "bg-blue-500",
  [OrderStatus.CONFIRMED]: "bg-green-500",
  [OrderStatus.PREPARING]: "bg-yellow-500",
  [OrderStatus.READY]: "bg-orange-500",
  [OrderStatus.DELIVERED]: "bg-gray-500",
  [OrderStatus.CANCELLED]: "bg-red-500",
  [OrderStatus.REJECTED]: "bg-red-600",
};

function StarRow({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-5 w-5 ${s <= Math.round(value) ? "fill-orange-400 text-orange-400" : "text-gray-300"} ${onChange ? "cursor-pointer" : ""}`}
          onClick={() => onChange?.(s)}
        />
      ))}
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const isCook = user?.role === "cook";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundInfo, setRefundInfo] = useState<{ reason: string; amount: number } | null>(null);

  // Buyer review state
  const [buyerReview, setBuyerReview] = useState<Review | null>(null);
  const [editingReview, setEditingReview] = useState(false);
  const [editRating, setEditRating] = useState({ taste: 5, portion: 5, hygiene: 5 });
  const [editComment, setEditComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  // Cook review state
  const [cookOrderReview, setCookOrderReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingReply, setEditingReply] = useState(false);
  const [editReplyText, setEditReplyText] = useState("");
  const [deletingReply, setDeletingReply] = useState(false);

  const rejectionShownRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrder();
    setupSocket();
    return () => {
      socket?.disconnect();
    };
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { data } = await orderApi.getOrderById(orderId!);
      setOrder(data);
      if (data.status === OrderStatus.DELIVERED) {
        if (isCook) {
          try {
            const result = await reviewApi.getKitchenReviews(data.kitchenId, 1, 100);
            const review = result.reviews.find((r: Review) => r.orderId === data.orderId) ?? null;
            setCookOrderReview(review);
          } catch { /* no review yet */ }
        } else {
          const review = await reviewApi.getReviewByOrderId(data.orderId);
          setBuyerReview(review);
        }
      }
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const token = localStorage.getItem("accessToken");
    const newSocket = io("http://localhost:5003", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      newSocket.emit("join:order", orderId);
    });

    newSocket.on("order:statusChanged", (updatedOrder: Order) => {
      setOrder(updatedOrder);
    });

    newSocket.on("order:cancelled", (updatedOrder: Order) => {
      setOrder(updatedOrder);
    });

    newSocket.on("order:rejected", (updatedOrder: Order) => {
      setOrder(updatedOrder);
      if (!rejectionShownRef.current) {
        rejectionShownRef.current = true;
        setRefundInfo({
          reason: updatedOrder.cancelReason || "Order rejected by cook",
          amount: updatedOrder.totalAmount
        });
        setRefundDialogOpen(true);
      }
    });

    setSocket(newSocket);
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    try {
      const { data } = await orderApi.cancelOrder(orderId!, cancelReason);
      setOrder(data);
      toast.success("Order cancelled successfully! Refund has been initiated.");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cancel order");
    }
  };

  // ── Buyer: start editing their review ──
  const handleStartEditReview = () => {
    if (!buyerReview) return;
    setEditRating({ taste: buyerReview.rating.taste, portion: buyerReview.rating.portion, hygiene: buyerReview.rating.hygiene });
    setEditComment(buyerReview.comment);
    setEditingReview(true);
  };

  const handleSaveReview = async () => {
    if (!buyerReview) return;
    setSavingReview(true);
    try {
      const updated = await reviewApi.updateReview(buyerReview._id, { rating: editRating, comment: editComment });
      setBuyerReview(updated);
      setEditingReview(false);
      toast.success("Review updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update review");
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!buyerReview) return;
    setDeletingReview(true);
    try {
      await reviewApi.deleteReview(buyerReview._id);
      setBuyerReview(null);
      toast.success("Review deleted.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    } finally {
      setDeletingReview(false);
    }
  };

  // ── Cook: submit reply ──
  const handleSubmitReply = async () => {
    if (!cookOrderReview || !replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const updated = await reviewApi.addCookReply(cookOrderReview._id, replyText.trim());
      setCookOrderReview(updated);
      setReplyText("");
      toast.success("Reply submitted!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  // ── Cook: edit reply ──
  const handleStartEditReply = () => {
    if (!cookOrderReview?.cookReply) return;
    setEditReplyText(cookOrderReview.cookReply);
    setEditingReply(true);
  };

  const handleSaveReply = async () => {
    if (!cookOrderReview) return;
    setSubmittingReply(true);
    try {
      const updated = await reviewApi.updateCookReply(cookOrderReview._id, editReplyText.trim());
      setCookOrderReview(updated);
      setEditingReply(false);
      toast.success("Reply updated!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!cookOrderReview) return;
    setDeletingReply(true);
    try {
      await reviewApi.deleteCookReply(cookOrderReview._id);
      setCookOrderReview({ ...cookOrderReview, cookReply: undefined, cookRepliedAt: undefined });
      toast.success("Reply deleted.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete reply");
    } finally {
      setDeletingReply(false);
    }
  };

  const canCancel = () => {
    if (!order) return false;
    if (order.status === OrderStatus.REJECTED) return false;
    if (![OrderStatus.PLACED, OrderStatus.CONFIRMED].includes(order.status)) return false;
    const timeSincePlaced = Date.now() - new Date(order.createdAt).getTime();
    return timeSincePlaced <= 15 * 60 * 1000;
  };

  if (loading) return <div className="p-8 text-center">Loading order...</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="outline" onClick={() => navigate("/orders")} className="mb-6">
        ← Back to Orders
      </Button>

      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge className={statusColors[order.status]}>{order.status}</Badge>
        </div>

        {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.REJECTED && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {statusSteps.map((status, idx) => (
                <div key={status} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        idx <= currentStepIndex ? "bg-green-500 text-white" : "bg-gray-300"
                      }`}
                    >
                      {idx < currentStepIndex ? <Check className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className="text-xs mt-2 text-center">{status}</span>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div
                      className={`h-1 flex-1 ${
                        idx < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-2">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Delivery Address</h3>
            <p className="text-gray-600">
              {order.deliveryAddress.label}<br />
              {order.deliveryAddress.street}<br />
              {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Delivery Time</h3>
            <p className="text-gray-600">{new Date(order.timeSlot).toLocaleString()}</p>
          </div>

          {order.cancelReason && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 text-red-600">
                {order.status === OrderStatus.REJECTED ? "Declined by Cook" : "Cancellation Reason"}
              </h3>
              <p className="text-gray-600">{order.cancelReason}</p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">✅ Refund Initiated</h4>
                <p className="text-sm text-blue-800">
                  💰 Amount: ₹{order.totalAmount}<br />
                  ⏱️ Your refund will be credited to your original payment method within 5-7 business days.<br />
                  📊 Check <a href="/transactions" className="underline font-medium">Transaction History</a> for refund status.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── COOK: view customer review + manage reply ── */}
      {order.status === OrderStatus.DELIVERED && isCook && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Customer Review</h3>
          {!cookOrderReview ? (
            <p className="text-sm text-gray-500">No review yet for this order.</p>
          ) : (
            <div className="space-y-4">
              {/* Star ratings */}
              <div className="flex items-center gap-2">
                <StarRow value={cookOrderReview.rating.overall} />
                <span className="text-sm text-gray-600">{cookOrderReview.rating.overall}/5 overall</span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Taste: {cookOrderReview.rating.taste}/5</span>
                <span>Portion: {cookOrderReview.rating.portion}/5</span>
                <span>Hygiene: {cookOrderReview.rating.hygiene}/5</span>
              </div>

              {/* Customer comment */}
              {cookOrderReview.comment && (
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{cookOrderReview.comment}</p>
              )}

              {/* Photos */}
              {cookOrderReview.photos?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {cookOrderReview.photos.map((url, i) => (
                    <img key={i} src={url} className="w-20 h-20 object-cover rounded border" alt="" />
                  ))}
                </div>
              )}

              {/* Cook reply section */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Your Reply</p>

                {cookOrderReview.cookReply && !editingReply ? (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                    <p className="text-sm text-gray-700">{cookOrderReview.cookReply}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={handleStartEditReply}
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs text-red-600 hover:bg-red-50"
                        onClick={handleDeleteReply}
                        disabled={deletingReply}
                      >
                        <Trash2 className="h-3 w-3" /> {deletingReply ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ) : editingReply ? (
                  <div>
                    <textarea
                      className="w-full p-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                      rows={3}
                      value={editReplyText}
                      onChange={(e) => setEditReplyText(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={handleSaveReply}
                        disabled={submittingReply || !editReplyText.trim()}
                      >
                        {submittingReply ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingReply(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      className="w-full p-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                      rows={3}
                      placeholder="Write a reply to this customer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Button
                      className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleSubmitReply}
                      disabled={submittingReply || !replyText.trim()}
                    >
                      {submittingReply ? "Submitting..." : "Submit Reply"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── BUYER: view their own review + cook reply ── */}
      {order.status === OrderStatus.DELIVERED && !isCook && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-3">Your Review</h3>

          {!buyerReview ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">You haven't reviewed this order yet.</p>
              <Link to={`/review/${order.orderId}`}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  ⭐ Write a Review
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Buyer's review (view or edit mode) */}
              {editingReview ? (
                <div className="space-y-3 bg-gray-50 p-4 rounded border">
                  <p className="text-sm font-medium">Edit your review</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-16">Taste</span>
                      <StarRow value={editRating.taste} onChange={(v) => setEditRating((r) => ({ ...r, taste: v }))} />
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-16">Portion</span>
                      <StarRow value={editRating.portion} onChange={(v) => setEditRating((r) => ({ ...r, portion: v }))} />
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-16">Hygiene</span>
                      <StarRow value={editRating.hygiene} onChange={(v) => setEditRating((r) => ({ ...r, hygiene: v }))} />
                    </div>
                  </div>
                  <textarea
                    className="w-full p-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                    rows={3}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Share your experience..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleSaveReview}
                      disabled={savingReview}
                    >
                      {savingReview ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingReview(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded border">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRow value={buyerReview.rating.overall} />
                    <span className="text-sm text-gray-600">{buyerReview.rating.overall}/5 overall</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500 mb-2">
                    <span>Taste: {buyerReview.rating.taste}/5</span>
                    <span>Portion: {buyerReview.rating.portion}/5</span>
                    <span>Hygiene: {buyerReview.rating.hygiene}/5</span>
                  </div>
                  {buyerReview.comment && (
                    <p className="text-gray-700 text-sm mb-3">{buyerReview.comment}</p>
                  )}
                  {buyerReview.photos?.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {buyerReview.photos.map((url, i) => (
                        <img key={i} src={url} className="w-20 h-20 object-cover rounded border" alt="" />
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {!buyerReview.cookReply && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={handleStartEditReview}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                    )}
                    {!buyerReview.cookReply && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs text-red-600 hover:bg-red-50"
                        onClick={handleDeleteReview}
                        disabled={deletingReview}
                      >
                        <Trash2 className="h-3 w-3" /> {deletingReview ? "Deleting..." : "Delete"}
                      </Button>
                    )}
                    {buyerReview.cookReply && (
                      <p className="text-xs text-gray-400 italic">Editing disabled after cook replied</p>
                    )}
                  </div>
                </div>
              )}

              {/* Cook reply (read-only for buyer) */}
              {buyerReview.cookReply && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded">
                  <p className="text-xs font-semibold text-orange-700 mb-1">Cook's Reply</p>
                  <p className="text-sm text-gray-700">{buyerReview.cookReply}</p>
                  {buyerReview.cookRepliedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(buyerReview.cookRepliedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {canCancel() && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Cancel Order</h3>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows={3}
            placeholder="Reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <Button variant="destructive" onClick={handleCancel}>
            Cancel Order
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            You can cancel within 15 minutes of placing the order
          </p>
        </Card>
      )}

      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              ⚠️ Order Declined by Cook
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your order has been declined by the cook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <p><strong>Reason:</strong> {refundInfo?.reason}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">✅ Refund Initiated</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>💰 Amount: ₹{refundInfo?.amount}</p>
                <p>⏱️ Refund will be credited to your original payment method within 5-7 business days</p>
                <p>📊 Check <a href="/transactions" className="underline font-medium">Transaction History</a> for refund status</p>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setRefundDialogOpen(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
