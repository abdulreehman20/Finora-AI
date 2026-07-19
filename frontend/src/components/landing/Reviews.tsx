"use client";

import { Star } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

const reviews = [
  {
    name: "Aisha Mehta",
    role: "Freelance Designer",
    avatar: "AM",
    avatarColor: "from-pink-500 to-rose-600",
    rating: 5,
    review:
      "Finora completely changed how I manage freelance income. The AI insights are incredibly detailed — it literally told me I was overspending on subscriptions I forgot I had!",
  },
  {
    name: "Rahul Sharma",
    role: "Software Engineer",
    avatar: "RS",
    avatarColor: "from-blue-500 to-cyan-600",
    rating: 5,
    review:
      "The automated monthly reports are a game changer. I get a full breakdown of my expenses in my inbox every month. It's like having a personal financial advisor.",
  },
  {
    name: "Priya Patel",
    role: "Entrepreneur",
    avatar: "PP",
    avatarColor: "from-purple-500 to-violet-600",
    rating: 5,
    review:
      "I've tried 5 finance apps and Finora is the only one that actually helped me save money. The budget alerts kept me on track last quarter.",
  },
  {
    name: "Alex Johnson",
    role: "Marketing Manager",
    avatar: "AJ",
    avatarColor: "from-amber-500 to-orange-600",
    rating: 5,
    review:
      "The dashboard is absolutely gorgeous. I check it every morning with my coffee. The spending trends chart helped me identify patterns I never noticed before.",
  },
  {
    name: "Sneha Reddy",
    role: "Medical Student",
    avatar: "SR",
    avatarColor: "from-green-500 to-emerald-600",
    rating: 5,
    review:
      "As a student on a tight budget, Finora's savings goals feature has been a lifesaver. I'm finally building an emergency fund thanks to the AI guidance.",
  },
  {
    name: "Omar Khalid",
    role: "Business Analyst",
    avatar: "OK",
    avatarColor: "from-teal-500 to-cyan-600",
    rating: 5,
    review:
      "What sets Finora apart is the AI's ability to contextualize your spending. It doesn't just show numbers — it explains them in plain language and gives actionable advice.",
  },
  {
    name: "Lin Wei",
    role: "Product Manager",
    avatar: "LW",
    avatarColor: "from-red-500 to-rose-600",
    rating: 5,
    review:
      "I recommended Finora to my entire team. The expense categorization is spot on and saves hours of manual tracking each week.",
  },
  {
    name: "Neha Singh",
    role: "Content Creator",
    avatar: "NS",
    avatarColor: "from-indigo-500 to-blue-600",
    rating: 5,
    review:
      "The multi-wallet support is exactly what I needed. I track my YouTube income, brand deals, and daily expenses all in one place. Absolutely love it!",
  },
  {
    name: "David Kim",
    role: "Startup Founder",
    avatar: "DK",
    avatarColor: "from-cyan-500 to-blue-600",
    rating: 5,
    review:
      "Running a startup means unpredictable cash flow. Finora's AI helps me see patterns and plan ahead. It's become an essential tool for my team.",
  },
  {
    name: "Zara Ahmed",
    role: "Financial Analyst",
    avatar: "ZA",
    avatarColor: "from-lime-500 to-green-600",
    rating: 5,
    review:
      "As a financial analyst, I appreciate the data accuracy and depth. Finora's reports are presentation-ready and the AI insights are genuinely valuable.",
  },
];

function ReviewCard({ review }: { review: (typeof reviews)[0] }) {
  return (
    <div className="flex-shrink-0 w-[300px] sm:w-[340px] p-6 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-sm mx-2">
      {/* Stars */}
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-green-400 text-green-400" />
        ))}
      </div>

      {/* Review text */}
      <p className="text-zinc-300 text-sm leading-relaxed mb-4 line-clamp-4">
        &ldquo;{review.review}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${review.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {review.avatar}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{review.name}</p>
          <p className="text-zinc-500 text-xs">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

/** Infinite marquee — clones the list twice for a seamless loop */
function MarqueeRow({
  items,
  direction = "left",
  duration = 40,
}: {
  items: typeof reviews;
  direction?: "left" | "right";
  duration?: number;
}) {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
      <motion.div
        animate={
          direction === "left"
            ? { x: [0, -50 * items.length * 10] }
            : { x: [-50 * items.length * 10, 0] }
        }
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration,
          ease: "linear",
        }}
        className="inline-flex"
        style={{ width: "max-content" }}
      >
        {doubled.map((review, idx) => (
          <ReviewCard key={idx} review={review} />
        ))}
      </motion.div>
    </div>
  );
}

export function ReviewsSection() {
  const firstRow = reviews.slice(0, 5);
  const secondRow = reviews.slice(5, 10);

  return (
    <section id="reviews" className="relative py-24 overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">
            Testimonials
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
        >
          Loved by{" "}
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Thousands
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-zinc-400 text-lg max-w-xl mx-auto mb-14"
        >
          Real stories from people who took charge of their finances with
          Finora.
        </motion.p>
      </div>

      {/* Marquee rows */}
      <div className="relative z-10 space-y-4">
        <MarqueeRow items={firstRow} direction="left" duration={35} />
        <MarqueeRow items={secondRow} direction="right" duration={30} />
      </div>
    </section>
  );
}
