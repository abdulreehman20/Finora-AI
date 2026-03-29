"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export function CTASection() {
  return (
    <section id="cta" className="relative py-20 overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Deep green-black gradient base — no blue */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#071a09] via-[#040f05] to-[#020a03]" />

          {/* Noise texture overlay at ~10% opacity with radial mask */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              maskImage:
                "radial-gradient(ellipse at center, black 40%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            }}
          />

          {/* Green glow orb */}
          <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-green-500/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-emerald-600/10 rounded-full blur-[60px] pointer-events-none" />

          {/* Top gradient lines (Aceternity style) */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />
          <div className="absolute top-[1px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          {/* Bottom gradient lines */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
          <div className="absolute bottom-[1px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />

          {/* Main content: two-column layout */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 p-8 md:p-12 lg:p-16">
            {/* Left column: text + CTA */}
            <div className="flex-1 text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold mb-5 uppercase tracking-wider"
              >
                <Sparkles className="w-3 h-3" />
                Ready to try Finora?
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5"
              >
                Take Control of
                <br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  Your Money Today
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-zinc-400 text-base lg:text-lg max-w-md mb-8 leading-relaxed"
              >
                Get instant access to AI-powered expense tracking, automated
                reports, and smart financial insights — all in one beautiful
                dashboard.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <Link
                  href="/auth/sign-up"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/20 text-white font-semibold rounded-full hover:border-green-500/40 hover:bg-white/5 transition-all duration-200"
                >
                  See Features
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-5 text-zinc-500 text-xs"
              >
                {[
                  "No credit card required",
                  "Free forever plan",
                  "Cancel anytime",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-green-500" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right column: staggered product images */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex-shrink-0 w-full lg:w-[420px] h-[280px] md:h-[340px] hidden sm:block"
            >
              {/* Back image — Finora dashboard.png — offset lower-right */}
              <div className="absolute right-0 top-8 w-[60%] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 rotate-2">
                <Image
                  src="/dashboard.png"
                  alt="Finora Dashboard Overview"
                  width={400}
                  height={280}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              {/* Front image — Finora dashboard-mockup.png — offset upper-left */}
              <div className="absolute left-0 top-0 w-[64%] rounded-2xl overflow-hidden border border-green-500/20 shadow-2xl shadow-green-500/15 -rotate-1">
                <Image
                  src="/dashboard-mockup.png"
                  alt="Finora Dashboard Mockup"
                  width={400}
                  height={280}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
