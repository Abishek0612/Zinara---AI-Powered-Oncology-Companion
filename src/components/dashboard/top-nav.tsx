"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  user: { name?: string | null };
}

export function TopNav({ user }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur md:px-8">
      <div className="pl-10 md:pl-0">
        <h2 className="text-lg font-semibold text-gray-900">
          Welcome back, {user.name?.split(" ")[0] || "there"}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-gray-500"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-gray-500"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
