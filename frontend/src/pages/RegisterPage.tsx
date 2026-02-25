import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/providers/AuthProvider";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { OtpVerifyForm } from "@/components/auth/OtpVerifyForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AuthData } from "@/types/auth.types";

type RegisterStep = "form" | "otp";

export function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>("form");
  const [phone, setPhone] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = (data: AuthData) => {
    login(data.user, data.accessToken, data.refreshToken);
    navigate("/");
  };

  const handleRegistered = (phone: string) => {
    setPhone(phone);
    setStep("otp");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Create Account
          </CardTitle>
          <CardDescription>
            {step === "form"
              ? "Join Ghar Ka Kitchen today"
              : "Verify your phone number"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "form" && (
            <RegisterForm onRegistered={handleRegistered} />
          )}
          {step === "otp" && (
            <OtpVerifyForm
              phone={phone}
              purpose="registration"
              onSuccess={handleAuthSuccess}
              onBack={() => setStep("form")}
            />
          )}
        </CardContent>

        <Separator />

        <CardFooter className="justify-center pt-4">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
