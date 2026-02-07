import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    if (!session.user.onboardingDone) redirect("/question/1");
    redirect("/treatment-plans"); 
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="text-2xl font-bold text-white">
          <span className="text-teal-400">Z</span>inara
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-teal-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-600"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="mb-4 inline-block rounded-full bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-400">
          Physician Informed · AI Powered
        </div>
        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white md:text-6xl">
          Your Intelligent{" "}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Oncology Partner
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-400 md:text-xl">
          Our platform delivers precision and personalization with the speed
          required when every second counts.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-teal-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:shadow-teal-500/40"
          >
            Start Your Journey
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-600 px-8 py-3.5 text-base font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
        {[
          {
            title: "Treatment Plans",
            desc: "AI-analyzed treatment options most likely to benefit you, based on latest research.",
            icon: "🎯",
          },
          {
            title: "Scientific Breakthroughs",
            desc: "Stay informed about the most recent breakthroughs most likely to benefit you.",
            icon: "🔬",
          },
          {
            title: "Clinical Trials",
            desc: "Identify the highest-value clinical trials that best fit you.",
            icon: "📋",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-8 backdrop-blur transition hover:border-teal-500/30 hover:bg-gray-800/80"
          >
            <div className="mb-4 text-3xl">{feature.icon}</div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}