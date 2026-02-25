import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendOtpSchema, type SendOtpFormData } from "@/lib/schemas";
import { authApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import axios from "axios";

interface PhoneOtpFormProps {
  onOtpSent: (phone: string) => void;
}

export function PhoneOtpForm({ onOtpSent }: PhoneOtpFormProps) {
  const form = useForm<SendOtpFormData>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = async (values: SendOtpFormData) => {
    try {
      const { data } = await authApi.sendOtp(values);
      if (data.success) {
        toast.success(data.message);
        onOtpSent(values.phone);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-medium">
                    +91
                  </span>
                  <Input
                    placeholder="9876543210"
                    maxLength={10}
                    {...field}
                  />
                </div>
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
          {form.formState.isSubmitting ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>
    </Form>
  );
}
