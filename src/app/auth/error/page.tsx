import { Suspense } from "react";
import { ErrorContent } from "@/components/auth/error-content";

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading error details...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
