import {
  IconBook,
  IconCar,
  IconCash,
  IconCirclePlus,
  IconDeviceLaptop,
  IconDots,
  IconGift,
  IconHeart,
  IconHome,
  IconMovie,
  IconPlane,
  IconShoppingBag,
  IconShoppingCart,
  IconSparkles,
  IconTag,
  IconTicket,
  IconToolsKitchen2,
  IconTrendingUp,
  IconBolt,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export const CATEGORY_ICON_OPTIONS = [
  "tag",
  "tools-kitchen-2",
  "shopping-cart",
  "shopping-bag",
  "car",
  "home",
  "bolt",
  "movie",
  "heart",
  "book",
  "plane",
  "ticket",
  "gift",
  "device-laptop",
  "trending-up",
  "sparkles",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number];

const ICON_MAP: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  tag: IconTag,
  "tools-kitchen-2": IconToolsKitchen2,
  "shopping-cart": IconShoppingCart,
  "shopping-bag": IconShoppingBag,
  car: IconCar,
  home: IconHome,
  bolt: IconBolt,
  movie: IconMovie,
  heart: IconHeart,
  book: IconBook,
  plane: IconPlane,
  ticket: IconTicket,
  gift: IconGift,
  "device-laptop": IconDeviceLaptop,
  "trending-up": IconTrendingUp,
  sparkles: IconSparkles,
  cash: IconCash,
  "circle-plus": IconCirclePlus,
  dots: IconDots,
};

export const CATEGORY_COLOR_OPTIONS = [
  "#14B8A6",
  "#22C55E",
  "#06B6D4",
  "#38BDF8",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
  "#D946EF",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#64748B",
] as const;

export function getCategoryIcon(icon: string) {
  return ICON_MAP[icon] ?? IconTag;
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
