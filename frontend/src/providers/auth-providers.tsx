"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

const appBaseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
      redirectTo={`${appBaseURL}/dashboard`}
      changeEmail
      signUp
      avatar
      social={{ providers: ["google"] }}
      credentials={{ username: true, usernameRequired: true }}
      account={{
        basePath: "/dashboard/",
        fields: ["image", "name", "username"],
      }}
    >
      {children}
    </AuthUIProvider>
  );
}
