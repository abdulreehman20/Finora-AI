"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  Navbar,
  NavbarButton,
  NavItems,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Home", link: "#home" },
  { name: "About", link: "#purpose" },
  { name: "Features", link: "#features" },
  { name: "Pricing", link: "#pricing" },
];

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    /* mt-4 gives the navbar a top margin so it's not glued to the edge */
    <div className="fixed inset-x-0 top-0 z-50 w-full pt-4 px-4 sm:px-6">
      <Navbar>
        {/* Desktop Nav */}
        <NavBody className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 !w-full !min-w-0 max-w-5xl mx-auto">
          {/* Logo */}
          <Link
            href="#home"
            className="relative z-20 flex items-center space-x-2 px-2 py-1"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              Finora
            </span>
          </Link>

          {/* Nav Items */}
          <NavItems items={navItems} className="text-zinc-300" />

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <NavbarButton
              href="/auth/sign-in"
              variant="secondary"
              className="text-zinc-300 hover:text-white bg-transparent border border-white/20 hover:border-white/40 rounded-full"
            >
              Login
            </NavbarButton>
            <NavbarButton
              href="/auth/sign-up"
              variant="gradient"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300"
            >
              Get Started
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Nav */}
        <MobileNav>
          <MobileNavHeader>
            {/* Mobile Logo */}
            <Link href="#home" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-white"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-bold text-lg text-white">Finora</span>
            </Link>
            <MobileNavToggle
              isOpen={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="bg-black/95 border border-white/10 rounded-2xl"
          >
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                onClick={() => setIsOpen(false)}
                className="w-full text-zinc-300 hover:text-green-400 font-medium py-2 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 w-full pt-4 border-t border-white/10">
              <Link
                href="/auth"
                className="w-full text-center py-2.5 px-4 border border-white/20 rounded-full text-zinc-300 hover:border-green-500/50 hover:text-white transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/auth"
                className="w-full text-center py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold shadow-lg shadow-green-500/30"
              >
                Get Started
              </Link>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
