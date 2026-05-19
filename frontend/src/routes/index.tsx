import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Zap,
  Brain,
  LineChart,
  Gauge,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Credexa — AI Loan Approval Intelligence" },
      { name: "description", content: "Instantly predict loan approval chances with explainable machine learning." },
    ],
  }),
});

function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const dur = 1400;
        const step = (t: number) => {
          const p = Math.min((t - start) / dur, 1);
          setVal(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

function FloatingCard({
  delay = 0, className = "", children,
}: { delay?: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={`glass rounded-2xl p-4 shadow-elegant animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  );
}

function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/40"
              style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-primary">
              <Brain className="h-3.5 w-3.5" /> Explainable AI · SHAP-powered
            </div>
            <h1 className="mt-6 text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.05]">
              <span className="text-gradient">AI-Powered</span><br />Loan Intelligence
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Instantly predict loan approval chances with explainable machine learning —
              built for clarity, designed for confidence.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/predict"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-95 transition"
              >
                Check Eligibility
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/"
                hash="insights"
                className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold hover:bg-card transition"
              >
                View AI Analytics
              </Link>
            </div>
          </motion.div>

          {/* Floating analytics cards */}
          <div className="relative mt-16 sm:mt-24 mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <FloatingCard delay={0}>
                <div className="text-xs text-muted-foreground">AI Accuracy</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight"><Counter to={97.4} decimals={1} suffix="%" /></div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-[color:var(--color-success)]"><ShieldCheck className="h-3 w-3" /> Validated</div>
              </FloatingCard>
              <FloatingCard delay={0.15}>
                <div className="text-xs text-muted-foreground">Approval Confidence</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight"><Counter to={92} suffix="%" /></div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary"><Gauge className="h-3 w-3" /> High</div>
              </FloatingCard>
              <FloatingCard delay={0.3}>
                <div className="text-xs text-muted-foreground">Credit Insights</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight"><Counter to={10} /></div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><LineChart className="h-3 w-3" /> Signals</div>
              </FloatingCard>
              <FloatingCard delay={0.45}>
                <div className="text-xs text-muted-foreground">Prediction Time</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight"><Counter to={0.4} decimals={1} suffix="s" /></div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary"><Zap className="h-3 w-3" /> Realtime</div>
              </FloatingCard>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Designed for clarity.</h2>
          <p className="mt-4 text-muted-foreground text-lg">Every prediction comes with the reasoning behind it — no black boxes, just elegant insight.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            { icon: Brain, t: "Explainable ML", d: "SHAP-based contributions show exactly why a decision was made." },
            { icon: Zap, t: "Sub-second", d: "Predictions stream in under half a second, every time." },
            { icon: ShieldCheck, t: "Private by design", d: "Inputs are processed transiently — never stored." },
          ].map(({ icon: Icon, t, d }, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-3xl p-7 hover:-translate-y-1 transition-transform"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* INSIGHTS */}
      <section id="insights" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Insights that speak human.</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Credexa translates dense model output into clear, considered narratives — so you understand the why, not just the what.
            </p>
          </div>
          <div className="space-y-3">
            {[
              "High income positively influenced approval.",
              "Strong credit score increased confidence.",
              "Existing liabilities reduced eligibility.",
            ].map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-4 flex items-start gap-3"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">{s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass rounded-3xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: 1240000, s: "+", l: "Predictions" },
            { v: 97.4, s: "%", d: 1, l: "AI accuracy" },
            { v: 0.4, s: "s", d: 1, l: "Avg response" },
            { v: 4.9, s: "/5", d: 1, l: "Satisfaction" },
          ].map((m) => (
            <div key={m.l}>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight">
                <Counter to={m.v} suffix={m.s} decimals={m.d ?? 0} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{m.l}</div>
            </div>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 hero-bg opacity-60" />
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Ready in 30 seconds.</h2>
            <p className="mt-3 text-muted-foreground">Predict your loan approval with explainable AI.</p>
            <Link
              to="/predict"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant"
            >
              Check Eligibility <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
