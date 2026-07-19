"use client";

import React from "react";

/**
 * Rich green-to-black gradient background for the full site.
 * Uses a radial gradient centered at the top so the hero area glows green
 * and it gracefully fades to near-black toward the bottom edges.
 * Also renders the subtle grid lines + dots on top.
 */
export function GridDotBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* Deep green → black radial gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 60% at 50% 0%, #0a1f0d 0%, #050f07 40%, #020805 65%, #000000 100%)",
        }}
      />

      {/* Subtle grid lines — very low opacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px),
            linear-gradient(to right, rgba(34,197,94,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Dot overlay — smaller grid, very subtle */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(34,197,94,0.18) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          opacity: 0.15,
        }}
      />

      {/* Edge vignette — darkens the very edges for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
        }}
      />
    </div>
  );
}
