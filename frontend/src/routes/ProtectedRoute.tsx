import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/providers/AuthProvider";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
