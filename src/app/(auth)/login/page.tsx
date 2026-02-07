import { Suspense } from "react";
import { LoginContent } from "@/components/auth/login-content";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-white">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}