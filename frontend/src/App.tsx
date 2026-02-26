import { AuthProvider } from "@/providers/AuthProvider";
import { AppRoutes } from "@/routes";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
