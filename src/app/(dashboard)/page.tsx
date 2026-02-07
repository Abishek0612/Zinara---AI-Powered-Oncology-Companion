import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Stethoscope,
  FlaskConical,
  FileText,
  MessageCircle,
  Utensils,
  Activity,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, reportsCount, chatCount] = await Promise.all([
    prisma.medicalProfile.findUnique({ where: { userId } }),
    prisma.report.count({ where: { userId } }),
    prisma.chatSession.count({ where: { userId } }),
  ]);

  const quickActions = [
    {
      href: "/treatment-plans",
      label: "Treatment Plans",
      desc: "AI-powered treatment options",
      icon: Stethoscope,
      color: "bg-teal-50 text-teal-700",
    },
    {
      href: "/clinical-trials",
      label: "Clinical Trials",
      desc: "Find matching trials",
      icon: FlaskConical,
      color: "bg-blue-50 text-blue-700",
    },
    {
      href: "/reports",
      label: "Reports",
      desc: `${reportsCount} reports uploaded`,
      icon: FileText,
      color: "bg-purple-50 text-purple-700",
    },
    {
      href: "/chat",
      label: "AI Assistant",
      desc: `${chatCount} conversations`,
      icon: MessageCircle,
      color: "bg-amber-50 text-amber-700",
    },
    {
      href: "/diet-lifestyle",
      label: "Diet & Lifestyle",
      desc: "Personalized recommendations",
      icon: Utensils,
      color: "bg-green-50 text-green-700",
    },
    {
      href: "/side-effects",
      label: "Side Effects",
      desc: "Track & manage symptoms",
      icon: Activity,
      color: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Patient Summary Card */}
      {profile && (
        <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white shadow-lg md:p-8">
          <h3 className="text-lg font-semibold">Your Profile Summary</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-teal-100">Cancer Type</p>
              <p className="text-lg font-medium">
                {profile.cancerType || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-teal-100">Stage</p>
              <p className="text-lg font-medium">
                {profile.cancerStage || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-teal-100">Current Treatment</p>
              <p className="text-lg font-medium">
                {profile.currentTreatment || "Not started"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`mb-3 inline-flex rounded-lg p-2.5 ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-gray-900 group-hover:text-teal-700">
                {action.label}
              </h4>
              <p className="mt-1 text-sm text-gray-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
