"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

const appBaseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function AuthPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const isSignOut = pathname.endsWith("/sign-out");

  useEffect(() => {
    // Sign-out must render while the session still exists so the
    // SignOut component can destroy it — do not bounce to dashboard.
    if (isSignOut) return;
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router, isSignOut]);

  if (isPending && !isSignOut) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </main>
    );
  }

  if (!isSignOut && session?.user) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <AuthView
        pathname={pathname}
        redirectTo={isSignOut ? "/" : `${appBaseURL}/dashboard`}
      />
    </main>
  );
}
