// components/landing/animations.ts
// Shared Framer Motion variants used across landing page sections.

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export const slideLeft = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0 },
};

export const slideRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0 },
};
