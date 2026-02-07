import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Stethoscope,
  FlaskConical,
  MessageCircle,
  Utensils,
  Activity,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await prisma.medicalProfile.findUnique({
    where: { userId: session.user.id },
  });

  const quickLinks = [
    {
      title: "Treatment Plans",
      description: "AI-powered treatment recommendations",
      icon: Stethoscope,
      href: "/treatment-plans",
      color: "bg-blue-500",
    },
    {
      title: "AI Assistant",
      description: "Chat with Zinara AI",
      icon: MessageCircle,
      href: "/chat",
      color: "bg-teal-500",
    },
    {
      title: "Clinical Trials",
      description: "Find relevant clinical trials",
      icon: FlaskConical,
      href: "/clinical-trials",
      color: "bg-purple-500",
    },
    {
      title: "Reports & Analysis",
      description: "Upload and analyze medical reports",
      icon: FileText,
      href: "/reports",
      color: "bg-orange-500",
    },
    {
      title: "Diet & Lifestyle",
      description: "Personalized nutrition guidance",
      icon: Utensils,
      href: "/diet-lifestyle",
      color: "bg-green-500",
    },
    {
      title: "Side Effects",
      description: "Track and manage symptoms",
      icon: Activity,
      href: "/side-effects",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name?.split(" ")[0] || "there"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's your personalized oncology dashboard
        </p>
      </div>

      {profile && (
        <div className="rounded-2xl border bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Medical Profile</h2>
              <div className="mt-4 space-y-2">
                {profile.cancerType && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Cancer Type: {profile.cancerType}</span>
                  </div>
                )}
                {profile.cancerStage && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Stage: {profile.cancerStage}</span>
                  </div>
                )}
                {profile.currentTreatment && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Current Treatment: {profile.currentTreatment}</span>
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/settings"
              className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30"
            >
              Update Profile
            </Link>
          </div>
        </div>
      )}

      {(!profile?.cancerType) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-900">
            Complete Your Medical Profile
          </h3>
          <p className="mt-2 text-sm text-amber-700">
            Add your cancer type and treatment information to get personalized AI
            recommendations.
          </p>
          <Link
            href="/settings"
            className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Complete Profile
          </Link>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`inline-flex rounded-lg ${link.color} p-3 text-white`}
              >
                <link.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-teal-600">
                {link.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Getting Started with Zinara
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-600">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Complete your medical profile
              </p>
              <p className="text-sm text-gray-600">
                Add your cancer type, stage, and current treatment in Settings
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-600">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Explore personalized treatment plans
              </p>
              <p className="text-sm text-gray-600">
                Get AI-powered recommendations based on your diagnosis
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-600">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Chat with Zinara AI</p>
              <p className="text-sm text-gray-600">
                Ask questions about treatments, side effects, and lifestyle
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
