"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Save, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [medicalProfile, setMedicalProfile] = useState({
    cancerType: "",
    cancerStage: "",
    currentTreatment: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);

  const handleUpdateProfile = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/patients/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
        return;
      }

      await update({ name: form.name });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/patients/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    const doubleConfirm = prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    if (doubleConfirm !== "DELETE") return;

    try {
      const res = await fetch(`/api/patients/${session?.user?.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Account deleted");
        signOut({ callbackUrl: "/" });
      } else {
        toast.error("Failed to delete account");
      }
    } catch {
      toast.error("Failed to delete account");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/medical-profile");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setMedicalProfile({
              cancerType: data.cancerType || "",
              cancerStage: data.cancerStage || "",
              currentTreatment: data.currentTreatment || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch medical profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateMedicalProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/medical-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medicalProfile),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update medical profile");
        return;
      }

      toast.success("Medical profile updated!");
    } catch {
      toast.error("Failed to update medical profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile Settings */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Profile Information
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} disabled className="mt-1 bg-gray-50" />
            <p className="mt-1 text-xs text-gray-400">
              Email cannot be changed
            </p>
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={isLoading}
            className="gap-2 bg-teal-500 text-white hover:bg-teal-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Medical Profile */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Medical Profile
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Cancer Type</Label>
            <Input
              value={medicalProfile.cancerType}
              onChange={(e) =>
                setMedicalProfile({ ...medicalProfile, cancerType: e.target.value })
              }
              placeholder="e.g., Breast Cancer, Lung Cancer"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Cancer Stage</Label>
            <Input
              value={medicalProfile.cancerStage}
              onChange={(e) =>
                setMedicalProfile({ ...medicalProfile, cancerStage: e.target.value })
              }
              placeholder="e.g., Stage 1, Stage 2, Stage 3, Stage 4"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Current Treatment</Label>
            <Input
              value={medicalProfile.currentTreatment}
              onChange={(e) =>
                setMedicalProfile({
                  ...medicalProfile,
                  currentTreatment: e.target.value,
                })
              }
              placeholder="e.g., Chemotherapy, Radiation, Immunotherapy"
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleUpdateMedicalProfile}
            disabled={isLoading || profileLoading}
            className="gap-2 bg-teal-500 text-white hover:bg-teal-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Update Medical Profile
          </Button>
        </div>
      </div>

      {/* Password */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isLoading}
            variant="outline"
            className="gap-2"
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Sign Out & Delete */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Account</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteAccount}
            className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
