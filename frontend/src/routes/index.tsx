import { BrowserRouter, Routes, Route } from "react-router";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { HomePage } from "@/pages/HomePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { CookDashboard } from "@/pages/cook/CookDashboard";
import { KitchenSetup } from "@/pages/cook/KitchenSetup";
import { MenuCreate } from "@/pages/cook/MenuCreate";
import { MenuManagement } from "@/pages/cook/MenuManagement";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cook/dashboard" element={<CookDashboard />} />
            <Route path="/cook/kitchen-setup" element={<KitchenSetup />} />
            <Route path="/cook/menu-create" element={<MenuCreate />} />
            <Route path="/cook/menu-management" element={<MenuManagement />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
