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
  if (!session.user.onboardingDone) redirect("/question/1");

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
