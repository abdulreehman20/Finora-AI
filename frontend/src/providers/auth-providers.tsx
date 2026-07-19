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
      navigate={(href) => {
        // Hard redirect after sign-out so no stale session/client state remains
        if (href === "/" || href === `${appBaseURL}/`) {
          window.location.assign("/");
          return;
        }
        router.push(href);
        router.refresh();
      }}
      replace={(href) => {
        if (href === "/" || href === `${appBaseURL}/`) {
          window.location.assign("/");
          return;
        }
        router.replace(href);
        router.refresh();
      }}
      onSessionChange={() => {
        router.refresh();
      }}
      Link={Link}
      redirectTo={`${appBaseURL}/dashboard`}
      changeEmail
      signUp
      avatar
      social={{ providers: [] }}
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
