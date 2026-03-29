"use client";

import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  ProvidersCard,
  SessionsCard,
  UpdateAvatarCard,
  UpdateNameCard,
  UpdateUsernameCard,
} from "@daveyplate/better-auth-ui";

export function AccountTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Account</h2>
        <p className="mt-0.5 text-sm text-zinc-400">
          Update your account settings.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <UpdateAvatarCard />
        <UpdateNameCard />
        <UpdateUsernameCard />
        <ChangeEmailCard />
        <ChangePasswordCard />
        <ProvidersCard />
        <SessionsCard />
        <DeleteAccountCard />
      </div>
    </div>
  );
}
