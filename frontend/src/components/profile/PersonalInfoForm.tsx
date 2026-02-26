import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib/schemas";
import { useAuth } from "@/providers/AuthProvider";
import { userApi } from "@/api/user.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function PersonalInfoForm() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      address: user?.addresses?.[0]?.street ?? "",
    },
  });

  const onSubmit = async (values: ProfileUpdateFormData) => {
    try {
      const { data } = await userApi.updateProfile(values);
      if (data.success && data.data) {
        updateUser(data.data);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message);
      } else {
        // Fallback: update localStorage when backend isn't ready
        updateUser({ name: values.name, email: values.email });
        toast.success("Profile updated locally");
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      address: user?.addresses?.[0]?.street ?? "",
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Information" : "Personal Information"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing
              ? "Update your personal details"
              : "View your personal details"}
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Edit
          </Button>
        )}
        {isEditing && (
          <Button
            onClick={handleCancel}
            variant="outline"
            className="border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            Cancel
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="rounded-lg bg-gray-50 p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-orange-600">Name</p>
              <p className="mt-1 text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600">Role</p>
              <p className="mt-1 capitalize text-gray-900">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600">Email</p>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600">Phone</p>
              <p className="mt-1 text-gray-900">+91 {user?.phone}</p>
            </div>
          </div>
          {user?.addresses?.[0]?.street && (
            <div>
              <p className="text-sm font-medium text-orange-600">Address</p>
              <p className="mt-1 text-gray-900">
                {user.addresses[0].street}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-orange-600">Verified</p>
              <p className="mt-1 text-gray-900">
                {user?.isVerified ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-600">
                Member Since
              </p>
              <p className="mt-1 text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-600">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-600">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium text-orange-600">
                    Phone
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      +91
                    </span>
                    <Input
                      value={user?.phone ?? ""}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Phone number cannot be changed here
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-orange-600">Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Address"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Submit"}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
