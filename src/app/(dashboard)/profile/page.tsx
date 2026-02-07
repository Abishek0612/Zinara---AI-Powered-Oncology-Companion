import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { User, Mail, Shield, MapPin, Calendar, Fingerprint } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        patientId: true,
        name: true,
        email: true,
        ipAddress: true,
        role: true,
        createdAt: true,
        image: true,
      },
    }),
    prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  if (!user) redirect("/login");

  const onboardingResponses = await prisma.onboardingResponse.findMany({
    where: { userId: session.user.id },
    orderBy: { stepNumber: "asc" },
    include: { question: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>

      {/* Basic Info */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700">
            {user.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500">
              Patient ID: {user.patientId}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoRow
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={user.email || "—"}
          />
          <InfoRow
            icon={<Shield className="h-4 w-4" />}
            label="Role"
            value={user.role}
          />
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="IP Address"
            value={user.ipAddress || "Not recorded"}
          />
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Account Created"
            value={formatDate(user.createdAt)}
          />
          <InfoRow
            icon={<Fingerprint className="h-4 w-4" />}
            label="Patient ID"
            value={user.patientId}
          />
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="Auth Method"
            value={user.image ? "Social Login" : "Email/Password"}
          />
        </div>
      </div>

      {/* Medical Profile */}
      {profile && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Medical Profile
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              icon={<span className="text-sm">🎗️</span>}
              label="Cancer Type"
              value={profile.cancerType || "Not specified"}
            />
            <InfoRow
              icon={<span className="text-sm">📊</span>}
              label="Stage"
              value={profile.cancerStage || "Not specified"}
            />
            <InfoRow
              icon={<span className="text-sm">💊</span>}
              label="Current Treatment"
              value={profile.currentTreatment || "Not started"}
            />
            <InfoRow
              icon={<span className="text-sm">👤</span>}
              label="Accessing For"
              value={
                profile.accessingFor === "SELF"
                  ? "Myself"
                  : profile.accessingFor === "LOVED_ONE"
                    ? "Loved One"
                    : "Other"
              }
            />
          </div>
          {profile.interests && (profile.interests as string[]).length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Interests</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {(profile.interests as string[]).map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Onboarding Responses */}
      {onboardingResponses.length > 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Onboarding Responses
          </h3>
          <div className="space-y-4">
            {onboardingResponses.map((resp) => (
              <div
                key={resp.id}
                className="rounded-lg bg-gray-50 p-4"
              >
                <p className="text-xs font-medium text-teal-600">
                  Question {resp.stepNumber}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {resp.question.questionText}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Answer: {resp.answer}
                </p>
                {resp.metadata &&
                  Object.keys(resp.metadata as object).length > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      Details: {JSON.stringify(resp.metadata)}
                    </p>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
