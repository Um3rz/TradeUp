"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { http, ApiException } from "@/lib/http";
import { useUser } from "@/context/UserContext";

type NameFormFields = {
  newName: string;
  currentPassword: string;
};

type EmailFormFields = {
  newEmail: string;
  currentPassword: string;
};

type PasswordFormFields = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function AccountSettingsPage() {
  const { user, refreshUser } = useUser();
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Name form
  const nameForm = useForm<NameFormFields>({
    defaultValues: {
      newName: user?.name || "",
      currentPassword: "",
    },
  });

  // Email form
  const emailForm = useForm<EmailFormFields>({
    defaultValues: {
      newEmail: user?.email || "",
      currentPassword: "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormFields>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function handleNameSubmit(data: NameFormFields) {
    if (!data.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!data.newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (data.newName === user?.name) {
      toast.error("New name is the same as current name");
      return;
    }

    setIsNameLoading(true);
    try {
      await http.put("/users/name", {
        newName: data.newName,
        currentPassword: data.currentPassword,
      });
      toast.success("Name updated successfully");
      await refreshUser();
      nameForm.setValue("currentPassword", "");
    } catch (error) {
      const message = error instanceof ApiException ? error.message : "Failed to update name";
      toast.error(message);
    } finally {
      setIsNameLoading(false);
    }
  }

  async function handleEmailSubmit(data: EmailFormFields) {
    if (!data.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!data.newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (data.newEmail === user?.email) {
      toast.error("New email is the same as current email");
      return;
    }

    setIsEmailLoading(true);
    try {
      await http.put("/users/email", {
        newEmail: data.newEmail,
        currentPassword: data.currentPassword,
      });
      toast.success("Email updated successfully");
      await refreshUser();
      emailForm.setValue("currentPassword", "");
    } catch (error) {
      const message = error instanceof ApiException ? error.message : "Failed to update email";
      toast.error(message);
    } finally {
      setIsEmailLoading(false);
    }
  }

  async function handlePasswordSubmit(data: PasswordFormFields) {
    if (!data.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!data.newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (data.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsPasswordLoading(true);
    try {
      await http.put("/users/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully");
      passwordForm.reset();
    } catch (error) {
      const message = error instanceof ApiException ? error.message : "Failed to update password";
      toast.error(message);
    } finally {
      setIsPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Change Name */}
      <Card>
        <CardHeader>
          <CardTitle>Change Name</CardTitle>
          <CardDescription>
            Update your display name. This will be visible across the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Full Name</Label>
              <Input
                id="newName"
                type="text"
                placeholder="Your name"
                {...nameForm.register("newName")}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="nameCurrentPassword">Current Password</Label>
              <Input
                id="nameCurrentPassword"
                type="password"
                placeholder="Enter your current password"
                autoComplete="current-password"
                {...nameForm.register("currentPassword")}
              />
              <p className="text-sm text-muted-foreground">
                Required to confirm changes
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isNameLoading}>
                {isNameLoading ? "Updating..." : "Update Name"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
          <CardDescription>
            Update your email address. This is used for login and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                {...emailForm.register("newEmail", {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />
              {emailForm.formState.errors.newEmail && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.newEmail.message}
                </p>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="emailCurrentPassword">Current Password</Label>
              <Input
                id="emailCurrentPassword"
                type="password"
                placeholder="Enter your current password"
                autoComplete="current-password"
                {...emailForm.register("currentPassword")}
              />
              <p className="text-sm text-muted-foreground">
                Required to confirm changes
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isEmailLoading}>
                {isEmailLoading ? "Updating..." : "Update Email"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password. Use a strong password with at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPasswordField">Current Password</Label>
              <Input
                id="currentPasswordField"
                type="password"
                placeholder="Enter your current password"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="newPasswordField">New Password</Label>
              <Input
                id="newPasswordField"
                type="password"
                placeholder="Enter your new password"
                autoComplete="new-password"
                {...passwordForm.register("newPassword", {
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPasswordField">Confirm New Password</Label>
              <Input
                id="confirmPasswordField"
                type="password"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                {...passwordForm.register("confirmPassword")}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
