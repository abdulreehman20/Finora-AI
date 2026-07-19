import { IconReceipt, IconSettings } from "@tabler/icons-react";

export type SettingsTab = "settings" | "billing";

export const SETTINGS_TABS: {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "settings", label: "Account", icon: IconSettings },
  { id: "billing", label: "Billings", icon: IconReceipt },
];
