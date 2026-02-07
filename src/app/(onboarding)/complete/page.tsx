"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  useEffect(() => {
    update({ onboardingDone: true });
  }, [update]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-gray-700/50 bg-gray-800/80 p-10 text-center shadow-2xl backdrop-blur"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="h-16 w-16 text-teal-400" />
      </motion.div>

      <h1 className="mt-6 text-2xl font-bold text-white">
        You&apos;re All Set!
      </h1>
      <p className="mt-3 max-w-md text-gray-400">
        Thank you, {session?.user?.name?.split(" ")[0] || "there"}! Your profile
        has been personalized based on your responses. Zinara is now ready to
        assist you with tailored oncology insights.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-teal-500 px-8 text-white hover:bg-teal-600"
        >
          Go to Dashboard
        </Button>
        <Button
          onClick={() => router.push("/chat")}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Talk to AI Assistant
        </Button>
      </div>
    </motion.div>
  );
}
