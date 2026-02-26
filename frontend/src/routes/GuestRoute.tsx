import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/providers/AuthProvider";

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
