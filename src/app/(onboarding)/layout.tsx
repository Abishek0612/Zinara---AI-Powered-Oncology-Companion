import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <Link href="/" className="text-xl font-bold text-white">
          <span className="text-teal-400">Z</span>inara
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-teal-500/20 text-center leading-8 text-sm text-teal-400">
            👤
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">{children}</main>
    </div>
  );
}