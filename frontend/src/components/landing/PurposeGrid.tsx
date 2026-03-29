"use client";

import { BarChart3, RefreshCcw, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

const purposes = [
  {
    icon: Zap,
    iconBg: "from-green-500 to-emerald-600",
    iconShadow: "shadow-green-500/40",
    heading: "Income & Expense Tracking",
    description:
      "Add and track every income and expense in one place. See exactly where your money goes with clear, organized records.",
  },
  {
    icon: BarChart3,
    iconBg: "from-blue-500 to-cyan-600",
    iconShadow: "shadow-blue-500/40",
    heading: "Track Your Money",
    description:
      "Visualize your finances with charts and breakdowns. Understand your spending patterns and stay in control of your money.",
  },
  {
    icon: RefreshCcw,
    iconBg: "from-amber-500 to-orange-600",
    iconShadow: "shadow-amber-500/40",
    heading: "AI-Generated Reports",
    description:
      "Get weekly or monthly AI-generated reports delivered to your inbox. Stay on top of your finances without the manual work.",
  },
  {
    icon: ShieldCheck,
    iconBg: "from-red-500 to-rose-600",
    iconShadow: "shadow-red-500/40",
    heading: "AI Assistant",
    description:
      "Add income or expenses through chat—no manual entry needed. The AI agent creates reports, helps you manage money, and explains where it goes.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export function PurposeSection() {
  return (
    <section id="purpose" className="relative py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">
            Our Purpose
          </span>
        </motion.div>

        {/* Section heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
        >
          Built Around Your
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            {" "}
            Financial Goals
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-zinc-400 text-lg max-w-2xl mx-auto mb-16"
        >
          Every feature is crafted to help you take full control of your money
          with clarity, speed, and intelligence.
        </motion.p>

        {/* 2×2 Grid with center loading icon */}
        <div className="relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/10"
          >
            {purposes.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative group bg-black/80 hover:bg-white/3 p-8 md:p-12 flex flex-col items-center text-center transition-all duration-300"
                >
                  {/* Icon */}
                  <div
                    className={`mb-6 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.iconBg} shadow-lg ${item.iconShadow} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.heading}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm max-w-xs">
                    {item.description}
                  </p>
                  {/* Hover gradient */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none rounded-none" />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Center Loading Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                type: "spring",
                stiffness: 200,
              }}
              className="relative"
            >
              {/* Outer ring */}
              <div className="w-16 h-16 rounded-full border-2 border-green-500/30 bg-black flex items-center justify-center">
                {/* Inner spinning ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-1 rounded-full border-2 border-transparent border-t-green-500 border-r-green-500/50"
                />
                {/* Center dot */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              {/* Pulse effect */}
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border border-green-500/30"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
