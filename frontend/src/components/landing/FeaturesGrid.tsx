"use client";

import {
  ArrowUpDown,
  BarChart3,
  Brain,
  FileText,
  MessageCircle,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import type React from "react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
  iconColor?: string;
  gradient?: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI Assistant",
    description:
      "Add income or expenses through chat—no manual entry needed. The AI agent helps you understand where your money goes, creates and sends AI-generated reports, and helps you manage your money.",
    className: "md:col-span-2 md:row-span-2",
    iconColor: "text-green-400",
    gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
  },
  {
    icon: ArrowUpDown,
    title: "Income & Expense Tracking",
    description:
      "Add and track every income and expense effortlessly. Categorize and organize your transactions in one place.",
    iconColor: "text-cyan-400",
    gradient: "from-cyan-500/15 via-transparent to-transparent",
  },
  {
    icon: BarChart3,
    title: "Track Your Money",
    description:
      "Visualize spending with charts and breakdowns. See where your money goes and understand your patterns.",
    iconColor: "text-blue-400",
    gradient: "from-blue-500/15 via-transparent to-transparent",
  },
  {
    icon: MessageCircle,
    title: "Add via Chat",
    description:
      "No manual forms. Tell the AI assistant in chat to add an expense or income—it does the rest.",
    iconColor: "text-amber-400",
    gradient: "from-amber-500/15 via-transparent to-transparent",
  },
  {
    icon: FileText,
    title: "AI-Generated Reports",
    description:
      "Weekly or monthly AI-generated reports delivered to your inbox. Get insights without the manual work.",
    iconColor: "text-purple-400",
    gradient: "from-purple-500/15 via-transparent to-transparent",
  },
  {
    icon: Wallet,
    title: "Money Management",
    description:
      "The AI assistant helps you manage your money, understand spending, and stay on top of your finances.",
    iconColor: "text-pink-400",
    gradient: "from-pink-500/15 via-transparent to-transparent",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  const isLarge = feature.className?.includes("md:col-span-2");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={`relative group rounded-2xl border border-white/10 bg-black/60 backdrop-blur-sm overflow-hidden ${feature.className || ""}`}
    >
      {/* Glowing mouse-tracking border effect */}
      <GlowingEffect
        spread={50}
        glow={true}
        disabled={false}
        proximity={80}
        inactiveZone={0.01}
        borderWidth={2}
      />

      {/* Background gradient reveal on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      <div
        className={`relative z-10 p-6 h-full flex flex-col ${isLarge ? "md:p-9" : ""}`}
      >
        {/* Icon */}
        <div
          className={`mb-5 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300 ${
            isLarge ? "w-16 h-16" : "w-12 h-12"
          }`}
        >
          <Icon
            className={`${isLarge ? "w-8 h-8" : "w-6 h-6"} ${feature.iconColor}`}
          />
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-white mb-3 ${isLarge ? "text-2xl md:text-3xl" : "text-lg"}`}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p
          className={`text-zinc-400 leading-relaxed ${isLarge ? "text-base md:text-lg max-w-sm" : "text-sm"}`}
        >
          {feature.description}
        </p>

        {isLarge && (
          <div className="mt-8">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              Try AI Insights →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function FeaturesGrid() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* ── Section-scoped grid background ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {/* Grid lines — slightly tighter than global */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
                            linear-gradient(rgba(34,197,94,0.1) 1px, transparent 1px),
                            linear-gradient(to right, rgba(34,197,94,0.1) 1px, transparent 1px)
                        `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Dot overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(34,197,94,0.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
            opacity: 0.2,
          }}
        />
        {/* Fade edges so it blends smoothly */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />
        {/* Central green glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-green-500/8 rounded-full blur-[100px]" />
        {/* Section border lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">
            Key Features
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
        >
          Everything You Need to{" "}
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Master Money
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-zinc-400 text-lg max-w-2xl mx-auto mb-16"
        >
          A complete suite of intelligent tools to track, analyze, and optimize
          your personal finances.
        </motion.p>

        {/* Bento grid — 3 cols, auto rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(190px,auto)] gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
