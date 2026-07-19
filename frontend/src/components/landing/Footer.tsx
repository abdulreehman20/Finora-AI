"use client";

import { motion } from "motion/react";
import Link from "next/link";
import React from "react";

const footerLinks = [
  {
    title: "Pages",
    links: [
      { label: "Home", href: "#home" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "About", href: "#purpose" },
    ],
  },
  {
    title: "Socials",
    links: [
      { label: "Twitter / X", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Instagram", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign Up", href: "/auth" },
      { label: "Login", href: "/auth" },
      { label: "Dashboard", href: "/account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[180px] bg-green-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 py-14">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-[220px]"
          >
            <Link href="#home" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Finora AI
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed">
              AI-powered expense tracker for smarter financial decisions.
            </p>
          </motion.div>

          {/* Link grids */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12">
            {footerLinks.map((group, gIdx) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: gIdx * 0.07 }}
              >
                <h4 className="text-white text-sm font-semibold mb-4 tracking-wide">
                  {group.title}
                </h4>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-zinc-400 text-sm hover:text-green-400 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06]" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-6">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Finora AI. All rights reserved.
          </p>
          <p className="text-zinc-600 text-sm flex items-center gap-1.5">
            Built with <span className="text-green-400">♥</span> for better
            finances
          </p>
        </div>
      </div>
    </footer>
  );
}
