import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.onboardingDone) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Setup Incomplete</h1>
        <p className="mb-6 text-gray-600">Please complete your onboarding profile to continue.</p>
        <a 
          href="/question/1" 
          className="rounded-lg bg-teal-500 px-6 py-2.5 font-medium text-white transition hover:bg-teal-600"
        >
          Continue Setup
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={session.user} />
      <div className="flex flex-1 flex-col md:ml-64">
        <TopNav user={session.user} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
