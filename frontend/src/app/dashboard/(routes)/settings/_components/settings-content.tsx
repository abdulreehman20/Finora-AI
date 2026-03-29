"use client";

import { useState } from "react";
import { AccountTab } from "./account-tab";
import { BillingTab } from "./billing-tab";
import { SETTINGS_TABS, type SettingsTab } from "./constants";

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("settings");

  return (
    <main className="min-h-screen bg-[oklch(0.06_0.01_145)] px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>

        {/* Tabbed Layout */}
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar Tabs */}
          <nav className="flex flex-row md:flex-col gap-1 md:w-48 shrink-0">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "settings" && <AccountTab />}
            {activeTab === "billing" && <BillingTab />}
          </div>
        </div>
      </div>
    </main>
  );
}
