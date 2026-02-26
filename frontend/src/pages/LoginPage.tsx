import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/providers/AuthProvider";
import { PhoneOtpForm } from "@/components/auth/PhoneOtpForm";
import { OtpVerifyForm } from "@/components/auth/OtpVerifyForm";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { AuthData } from "@/types/auth.types";

type LoginStep = "phone" | "otp";

export function LoginPage() {
  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = (data: AuthData) => {
    login(data.user, data.accessToken, data.refreshToken);
    navigate("/");
  };

  const handleOtpSent = (phone: string) => {
    setPhone(phone);
    setStep("otp");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-orange-500">
            Ghar Ka Kitchen
          </CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="phone" onValueChange={() => setStep("phone")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Phone OTP</TabsTrigger>
              <TabsTrigger value="email">Email & Password</TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="mt-4">
              {step === "phone" && (
                <PhoneOtpForm onOtpSent={handleOtpSent} />
              )}
              {step === "otp" && (
                <OtpVerifyForm
                  phone={phone}
                  purpose="login"
                  onSuccess={handleAuthSuccess}
                  onBack={() => setStep("phone")}
                />
              )}
            </TabsContent>

            <TabsContent value="email" className="mt-4">
              <AdminLoginForm onSuccess={handleAuthSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>

        <Separator />

        <CardFooter className="justify-center pt-4">
          <p className="text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
