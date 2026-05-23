"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { SettingsLoader } from "@/components/layout/SettingsLoader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <SettingsLoader />
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      <AnimatePresence>
        {splashDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-screen flex flex-col"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
