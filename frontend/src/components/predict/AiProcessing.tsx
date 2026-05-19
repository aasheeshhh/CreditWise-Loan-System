import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function AiProcessing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass rounded-3xl p-10 sm:p-16 text-center shadow-elegant relative overflow-hidden"
    >
      <div className="absolute inset-0 hero-bg opacity-60" />
      <div className="relative">
        <div className="mx-auto relative h-24 w-24">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-primary/30"
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
            />
          ))}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full bg-gradient-to-tr from-primary to-cyan-400 grid place-items-center text-primary-foreground"
          >
            <Sparkles className="h-7 w-7" />
          </motion.div>
        </div>
        <motion.h3
          key={Math.random()}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 text-xl sm:text-2xl font-semibold tracking-tight"
        >
          Analyzing financial profile…
        </motion.h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Running explainable ML across 10 weighted signals
        </p>
        <div className="mx-auto mt-6 h-1 w-64 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
