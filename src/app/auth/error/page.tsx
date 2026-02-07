"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please try again later.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  OAuthSignin: "Error constructing an authorization URL. Please try again.",
  OAuthCallback: "Error handling the OAuth callback. Please try again.",
  OAuthCreateAccount: "Could not create OAuth account. Please try a different method.",
  EmailCreateAccount: "Could not create email account. Please try a different method.",
  Callback: "Error in the OAuth callback handler. Please try again.",
  OAuthAccountNotLinked: "Email already in use with a different sign-in method.",
  EmailSignin: "The email sign-in link is invalid or has expired.",
  CredentialsSignin: "Sign in failed. Check your credentials and try again.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unexpected error occurred. Please try again.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Error
        </h1>
        
        <p className="text-gray-600 mb-8">
          {errorMessages[error] || errorMessages.Default}
        </p>

        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sign In
          </Link>
          
          <Link
            href="/"
            className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>

        {error !== "Default" && (
          <p className="mt-6 text-sm text-gray-500">
            Error code: <code className="bg-gray-100 px-2 py-1 rounded">{error}</code>
          </p>
        )}
      </div>
    </div>
  );
}
