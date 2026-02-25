import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, type VerifyOtpFormData } from "@/lib/schemas";
import { authApi } from "@/api/auth.api";
import { useCountdown } from "@/hooks/useCountdown";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import axios from "axios";
import type { AuthData, OtpPurpose } from "@/types/auth.types";

interface OtpVerifyFormProps {
  phone: string;
  purpose: OtpPurpose;
  onSuccess: (data: AuthData) => void;
  onBack: () => void;
}

export function OtpVerifyForm({
  phone,
  purpose,
  onSuccess,
  onBack,
}: OtpVerifyFormProps) {
  const { seconds, isActive, start } = useCountdown(60);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    start();
  }, [start]);

  const maskedPhone = phone.slice(0, 5) + "XXXXX";

  const onSubmit = async (values: VerifyOtpFormData) => {
    try {
      const apiCall =
        purpose === "login"
          ? authApi.verifyLoginOtp({ phone, otp: values.otp })
          : authApi.verifyOtp({ phone, otp: values.otp, purpose });

      const { data } = await apiCall;
      if (data.success && data.data) {
        toast.success(data.message);
        onSuccess(data.data);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { data } = await authApi.resendOtp({ phone, purpose });
      if (data.success) {
        toast.success("OTP resent successfully");
        start();
        form.reset();
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to resend OTP.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        OTP sent to <span className="font-medium">+91 {maskedPhone}</span>
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter OTP</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center justify-between text-sm">
        <Button variant="link" className="h-auto p-0" onClick={onBack}>
          Change number
        </Button>
        <Button
          variant="link"
          className="h-auto p-0"
          disabled={isActive || isResending}
          onClick={handleResend}
        >
          {isActive ? `Resend in ${seconds}s` : "Resend OTP"}
        </Button>
      </div>
    </div>
  );
}
