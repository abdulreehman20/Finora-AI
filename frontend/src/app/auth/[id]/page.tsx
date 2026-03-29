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

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </main>
    );
  }

  if (session?.user) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <AuthView pathname={pathname} redirectTo={`${appBaseURL}/dashboard`} />
    </main>
  );
}
