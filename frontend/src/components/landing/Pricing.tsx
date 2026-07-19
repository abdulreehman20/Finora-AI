"use client";

import { Check, Zap } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React, { useState } from "react";

const plans = {
  monthly: {
    price: "$10",
    period: "/month",
    billing: "Billed monthly",
    savings: null,
  },
  yearly: {
    price: "$8",
    period: "/month",
    billing: "Billed $96/year",
    savings: "Save 20%",
  },
};

const features = [
  "Unlimited income & expense tracking",
  "AI assistant (add via chat)",
  "AI-generated weekly reports",
  "AI-generated monthly reports",
  "Report delivery to your inbox",
  "Money tracking & insights",
  "Understand where your money goes",
  "AI-powered money management",
];

const freeFeatures = [
  "Up to 50 transactions/month",
  "Basic income & expense tracking",
  "Manual transaction entry",
  "Monthly summary",
];

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">
            Pricing
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
        >
          Simple,{" "}
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Transparent
          </span>{" "}
          Pricing
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-zinc-400 text-lg max-w-xl mx-auto mb-10"
        >
          No hidden fees. No surprises. Just powerful tools to transform your
          financial life.
        </motion.p>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <span
            className={`text-sm font-medium transition-colors ${billing === "monthly" ? "text-white" : "text-zinc-500"}`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBilling(billing === "monthly" ? "yearly" : "monthly")
            }
            className="relative w-14 h-7 rounded-full border border-white/20 bg-white/5 transition-colors duration-300 focus:outline-none"
            aria-label="Toggle billing period"
          >
            <motion.div
              animate={{ x: billing === "yearly" ? 28 : 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-1 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/40"
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors flex items-center gap-2 ${billing === "yearly" ? "text-white" : "text-zinc-500"}`}
          >
            Yearly
            {billing === "yearly" && (
              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                Save 20%
              </span>
            )}
          </span>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm p-8"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <p className="text-zinc-400 text-sm">
                Perfect for getting started with your finances.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold text-white">$0</span>
                <span className="text-zinc-400 mb-2">/month</span>
              </div>
              <p className="text-zinc-500 text-sm mt-1">Free forever</p>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full border border-zinc-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-zinc-400" />
                  </div>
                  <span className="text-zinc-400 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth"
              className="block w-full text-center py-3 px-6 border border-white/20 text-white rounded-full font-semibold hover:border-white/40 hover:bg-white/5 transition-all duration-200"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="relative rounded-2xl border border-green-500/40 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-black p-8 overflow-hidden"
          >
            {/* Popular badge */}
            <div className="absolute top-6 right-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs font-semibold text-green-400">
                <Zap className="w-3 h-3" />
                Most Popular
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-500/15 rounded-full blur-[60px] pointer-events-none" />

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <p className="text-zinc-400 text-sm">
                Full power of Finora's AI platform.
              </p>
            </div>

            <div className="mb-8">
              <motion.div
                key={billing}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-end gap-1"
              >
                <span className="text-5xl font-extrabold text-white">
                  {plans[billing].price}
                </span>
                <span className="text-zinc-400 mb-2">
                  {plans[billing].period}
                </span>
              </motion.div>
              <p className="text-zinc-500 text-sm mt-1">
                {plans[billing].billing}
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-zinc-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth"
              className="block w-full text-center py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Pro Plan
            </Link>
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-zinc-600 text-sm mt-10"
        >
          Cancel anytime. No questions asked. 14-day money-back guarantee.
        </motion.p>
      </div>
    </section>
  );
}
