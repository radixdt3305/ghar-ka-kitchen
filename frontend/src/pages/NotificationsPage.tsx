import { useState, useEffect } from "react";
import { notificationApi } from "../api/notification.api";
import type { Notification } from "../types/notification.types";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Bell, Loader2, Trash2, CheckCheck } from "lucide-react";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  order_placed: "bg-blue-100 text-blue-800",
  order_confirmed: "bg-green-100 text-green-800",
  order_preparing: "bg-yellow-100 text-yellow-800",
  order_ready: "bg-orange-100 text-orange-800",
  order_delivered: "bg-gray-100 text-gray-800",
  order_cancelled: "bg-red-100 text-red-800",
  order_rejected: "bg-red-100 text-red-800",
  payment_received: "bg-emerald-100 text-emerald-800",
  payment_refunded: "bg-purple-100 text-purple-800",
  review_received: "bg-pink-100 text-pink-800",
  cook_reply: "bg-indigo-100 text-indigo-800",
};

const typeIcons: Record<string, string> = {
  order_placed: "📦",
  order_confirmed: "✅",
  order_preparing: "👨‍🍳",
  order_ready: "🛵",
  order_delivered: "🎉",
  order_cancelled: "❌",
  order_rejected: "⚠️",
  payment_received: "💰",
  payment_refunded: "↩️",
  review_received: "⭐",
  cook_reply: "💬",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const result = await notificationApi.getNotifications(1, 50);
      setNotifications(result.notifications);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      (window as any).refreshUnreadCount?.();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-orange-500 text-white">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={markingAll}>
            {markingAll ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCheck className="h-4 w-4 mr-1" />}
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <Bell className="h-12 w-12" />
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm">You'll see order updates, payment receipts, and more here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification._id}
              className={`transition-colors ${!notification.isRead ? "border-orange-200 bg-orange-50/40" : ""}`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
            >
              <CardContent className="py-4 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">
                  {typeIcons[notification.type] || "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                    )}
                    <Badge className={`text-xs ${typeColors[notification.type] || "bg-gray-100 text-gray-800"}`}>
                      {notification.type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{notification.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(notification._id); }}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
