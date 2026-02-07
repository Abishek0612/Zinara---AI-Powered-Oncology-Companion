import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTreatmentInfo } from "@/lib/gemini";
import { getCachedData } from "@/lib/redis";
import { redirect } from "next/navigation";
import { TreatmentView } from "@/components/treatment/treatment-view";

export default async function TreatmentPlansPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
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
      
      // Use Redis caching for performance (same logic as API route)
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
