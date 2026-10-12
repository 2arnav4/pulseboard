"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** template.tsx re-mounts on every navigation, giving each section a smooth enter transition. */
export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
