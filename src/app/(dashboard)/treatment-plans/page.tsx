import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTreatmentInfo } from "@/lib/gemini";
import { getCachedData } from "@/lib/redis";
import { redirect } from "next/navigation";
import { TreatmentView } from "@/components/treatment/treatment-view";

export default async function TreatmentPlansPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900">Session Error</h2>
        <p className="mt-2 text-gray-600">Please verify your session.</p>
        <a 
          href="/login" 
          className="mt-4 rounded-lg bg-teal-500 px-6 py-2 text-white hover:bg-teal-600"
        >
          Login Again
        </a>
      </div>
    );
  }

  // Fetch data on the server
  let treatmentInfo: string | null = null;
  let error: string | null = null;

  try {
    const profile = await prisma.medicalProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile?.cancerType) {
      error = "Cancer type not specified in your profile. Please update your settings.";
    } else {
      const cacheKey = `treatment:${profile.cancerType}:${profile.cancerStage || "unknown"}`;
      
      // Use Redis caching for performance 
      treatmentInfo = await getCachedData(
        cacheKey,
        () =>
          getTreatmentInfo(
            profile.cancerType!,
            profile.cancerStage || "unknown",
            profile.currentTreatment || undefined
          ),
        3600 // Cache for 1 hour
      );
    }
  } catch (err) {
    console.error("Failed to load treatment plan:", err);
    error = "Failed to load treatment information. Please try refreshing.";
  }

  return <TreatmentView initialContent={treatmentInfo} initialError={error} />;
}
