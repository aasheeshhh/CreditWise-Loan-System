import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { PredictionForm } from "@/components/predict/PredictionForm";
import { PredictionResult } from "@/components/predict/PredictionResult";
import { AiProcessing } from "@/components/predict/AiProcessing";
import { predictLoan, type PredictInput, type PredictResult } from "@/lib/predict.functions";

export const Route = createFileRoute("/predict")({
  component: PredictPage,
});

function PredictPage() {
  const [phase, setPhase] = useState<"form" | "processing" | "result">("form");
  const [result, setResult] = useState<PredictResult | null>(null);

  const onSubmit = async (data: PredictInput) => {
    setPhase("processing");

    try {
      const res = await predictLoan(data);
      setResult(res);
      setPhase("result");
      toast.success(
        res.prediction === "Approved"
          ? "Approved with high confidence"
          : "Profile analyzed",
      );
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
      setPhase("form");
    }
  };

  return (
    <section className="relative">
      <div className="absolute inset-0 hero-bg opacity-60 pointer-events-none" />
      <div className="relative mx-auto max-w-5xl px-6 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Your loan, <span className="text-gradient">predicted intelligently</span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Enter your details below. Advanced fields are optional — they only sharpen accuracy.
          </p>
        </motion.div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {phase === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PredictionForm onSubmit={onSubmit} />
              </motion.div>
            )}
            {phase === "processing" && (
              <motion.div key="proc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AiProcessing />
              </motion.div>
            )}
            {phase === "result" && result && (
              <motion.div
                key="res"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <PredictionResult result={result} />
                <div className="mt-8 text-center">
                  <button
                    onClick={() => {
                      setPhase("form");
                      setResult(null);
                    }}
                    className="inline-flex items-center rounded-full glass px-6 py-3 text-sm font-medium hover:bg-card transition"
                  >
                    Run another prediction
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
