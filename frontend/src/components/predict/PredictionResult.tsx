import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import type { PredictResult } from "@/lib/predict.functions";

export function PredictionResult({ result }: { result: PredictResult }) {
  const approved = result.prediction === "Approved";
  const pct = Math.round(result.approvalProbability * 100);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass rounded-3xl p-8 shadow-elegant relative overflow-hidden"
      >
        <div
          className="absolute -inset-px rounded-3xl opacity-40 blur-2xl pointer-events-none"
          style={{
            background: approved
              ? "radial-gradient(400px 200px at 20% 0%, oklch(0.7 0.18 152 / 0.5), transparent 60%)"
              : "radial-gradient(400px 200px at 20% 0%, oklch(0.65 0.22 25 / 0.45), transparent 60%)",
          }}
        />
        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                approved ? "bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]" : "bg-destructive/15 text-destructive"
              }`}
            >
              {approved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              {approved ? "Approved" : "Needs improvement"}
            </div>
            <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight">
              {pct}% <span className="text-muted-foreground text-2xl font-normal">approval probability</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Model confidence{" "}
              <span className="text-foreground font-medium">{Math.round(result.confidence * 100)}%</span>.
              {approved
                ? " Your profile meets the criteria across the strongest signals."
                : " A few adjustments could materially improve your odds."}
            </p>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={[{ name: "score", value: pct, fill: approved ? "var(--color-success)" : "var(--color-destructive)" }]}
                startAngle={220}
                endAngle={-40}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "var(--color-muted)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Insights + Suggestions */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">AI insights</h3>
          <ul className="mt-4 space-y-3">
            {result.insights.map((i, k) => (
              <motion.li
                key={k}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + k * 0.07 }}
                className="flex items-start gap-3 rounded-xl bg-card/50 p-3"
              >
                <span
                  className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full ${
                    i.type === "positive"
                      ? "bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]"
                      : i.type === "negative"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i.type === "positive" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
                <span className="text-sm leading-relaxed">{i.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-6"
        >
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            {approved ? "Ways to strengthen further" : "Improvement suggestions"}
          </h3>
          <ul className="mt-4 space-y-3">
            {(result.suggestions.length ? result.suggestions : ["Your profile is well-positioned across all key signals."]).map((s, k) => (
              <li key={k} className="flex items-start gap-3 rounded-xl bg-card/50 p-3">
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary">
                  <Lightbulb className="h-4 w-4" />
                </span>
                <span className="text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* SHAP Waterfall / Feature contributions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-3xl p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            SHAP feature contributions
          </h3>
          <span className="text-xs text-muted-foreground">Positive ↑ approval · Negative ↓ approval</span>
        </div>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={result.shap_values
                .slice()
                .sort((a, b) => b.value - a.value)
                .map((s) => ({ name: s.feature, value: +(s.value * 100).toFixed(1), raw: s.raw }))}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
            >
              <XAxis type="number" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fill: "var(--color-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                {result.shap_values.map((s, i) => (
                  <Cell key={i} fill={s.value >= 0 ? "var(--color-success)" : "var(--color-destructive)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
