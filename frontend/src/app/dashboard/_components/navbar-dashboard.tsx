"use client";

import { UserButton } from "@daveyplate/better-auth-ui";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { name: "Overview", href: "/dashboard" },
  { name: "Transactions", href: "/dashboard/transactions" },
  { name: "Reports", href: "/dashboard/reports" },
  { name: "Ai Chats", href: "/dashboard/chat" },
  { name: "Settings", href: "/dashboard/settings" },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-white"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight text-white">
        Finora
      </span>
    </Link>
  );
}

function NavLink({
  link,
  active,
  onClick,
}: {
  link: (typeof navLinks)[0];
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      key={link.href}
      href={link.href}
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        active
          ? "text-white"
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {active && (
        <span className="absolute inset-0 rounded-lg bg-white/10 -z-10" />
      )}
      {link.name}
      {active && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-green-500" />
      )}
    </Link>
  );
}

export function DashboardNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[oklch(0.06_0.01_145)]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        {/* Left — Logo + Name */}
        <Logo />

        {/* Center — Navigation Links (desktop only) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink key={link.href} link={link} active={isActive(link.href)} />
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* User Button (desktop) */}
          <div className="hidden md:flex">
            <Link href="/dashboard/settings">
              <UserButton
                size={"icon"}
                className="[&_button]:ring-green-500/40 [&_button]:hover:ring-green-500/60"
              />
            </Link>
          </div>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            id="mobile-menu-toggle"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
            className="flex md:hidden items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
          >
            <IconMenu2 size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 bg-[oklch(0.08_0.01_145)] border-white/10 flex flex-col p-0"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {/* Sheet Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <Logo />
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <IconX size={16} />
            </button>
          </div>

          {/* Sheet Nav Links */}
          <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Sheet User Button */}
          <div className="border-t border-white/10 p-4">
            <Link
              href="/dashboard/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <UserButton
                size={"icon"}
                className="[&_button]:ring-green-500/40 pointer-events-none"
              />
              <span className="text-sm font-medium text-zinc-300">
                Account Settings
              </span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
