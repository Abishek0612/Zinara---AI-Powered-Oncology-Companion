"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialButtons } from "@/components/auth/social-buttons";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but login failed. Please sign in.");
        router.push("/login");
        return;
      }

      toast.success("Welcome to Zinara!");
      router.push("/question/1");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gray-800/80 p-8 shadow-2xl backdrop-blur">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
        <p className="mt-2 text-sm text-gray-400">
          Join Zinara for personalized oncology insights
        </p>
      </div>

      <SocialButtons />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-700" />
        <span className="text-xs text-gray-500">OR</span>
        <div className="h-px flex-1 bg-gray-700" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-gray-300">
            Full Name
          </Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Sanjay Sharma"
            required
            minLength={2}
            className="mt-1 border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-gray-300">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="sanjay@example.com"
            required
            className="mt-1 border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-gray-300">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 8 chars, uppercase + number"
            required
            minLength={8}
            className="mt-1 border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500"
          />
        </div>

        <p className="text-xs text-gray-500">
          By registering, I agree to the{" "}
          <span className="text-teal-400">Terms of Service</span> and{" "}
          <span className="text-teal-400">Privacy Policy</span>
        </p>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-500 text-white hover:bg-teal-600"
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-400 hover:text-teal-300">
          Log in
        </Link>
      </p>
    </div>
  );
}