"use client";

import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

/**
 * Lightweight perspective-tilt dashboard preview.
 * Avoids the 60rem/80rem blank height of ContainerScroll.
 */
function DashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.92, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0.5, 1]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-5xl mx-auto px-4 pb-10"
      style={{ perspective: "1200px" }}
    >
      {/* subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="flex items-center gap-2 justify-center text-zinc-500 text-sm mb-5"
      >
        <TrendingUp className="w-4 h-4 text-green-500" />
        <span>Your financial command center</span>
      </motion.div>

      {/* tilt card */}
      <motion.div
        style={{ rotateX, scale, opacity }}
        className="rounded-2xl overflow-hidden border border-green-500/20 shadow-2xl shadow-green-500/10"
      >
        <Image
          src="/dashboard.png"
          alt="Finora AI Dashboard — Expense Tracker"
          width={1400}
          height={800}
          className="w-full h-auto object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden flex flex-col items-center"
    >
      {/* Ripple Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundRippleEffect rows={10} cols={30} cellSize={60} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-green-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-green-400/5 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {/* Hero Text Content */}
      <div className="relative z-10 flex flex-col items-center pt-36 pb-12 px-4 w-full max-w-5xl mx-auto text-center">
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-7"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-sm text-sm text-green-400 font-medium">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>AI-Powered Financial Assistant</span>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.06] mb-6"
        >
          <span className="text-white">Track Smarter,</span>
          <br />
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Spend Better
          </span>
        </motion.h1>

        {/* Gradient separator line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.38, ease: "easeOut" }}
          className="w-48 h-px mb-6 bg-gradient-to-r from-transparent via-green-400/70 to-transparent"
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed mb-9"
        >
          Know exactly where your money goes. Log expenses, visualize trends,
          and let AI guide you toward financial freedom — one smart decision at
          a time.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.58 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/auth/sign-up"
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-1 transition-all duration-300 text-base"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href="/auth/sign-in"
            className="flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:border-green-500/40 hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 text-base backdrop-blur-sm"
          >
            Login to Dashboard
          </Link>
        </motion.div>
      </div>

      {/* Dashboard Preview — tilt animation, no massive height */}
      <div className="relative z-10 w-full">
        <DashboardPreview />
      </div>
    </section>
  );
}
