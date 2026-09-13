import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Briefcase,
  ChevronDown,
  GraduationCap,
  DollarSign,
  Calendar,
  Gauge,
  Users,
  Building2,
  Wallet,
  Home,
  Sparkles,
} from "lucide-react";
import type { PredictInput } from "@/lib/predict.functions";
import { parseNumericInput } from "@/lib/numeric-input";

type Props = {
  onSubmit: (data: PredictInput) => void;
  loading?: boolean;
};

/** Numeric fields may be "" while the user clears/edits the input. */
type NumericKey = {
  [K in keyof PredictInput]-?: PredictInput[K] extends number ? K : never;
}[keyof PredictInput];

type FormState = {
  [K in keyof PredictInput]: K extends NumericKey ? number | "" : PredictInput[K];
};

const initial: FormState = {
  // Defaults must sit inside the backend/model training ranges.
  income: 65000,
  loanAmount: 250000,
  creditScore: 720,
  loanTerm: 60,
  employmentStatus: "employed",
  education: "graduate",
  coapplicantIncome: 0,
  savings: 50000,
  collateralValue: 0,
  existingLoans: 0,
  dependents: 0,
  age: 32,
  employerCategory: "private",
  loanPurpose: "personal",
  propertyArea: "urban",
};

function toPredictInput(data: FormState): PredictInput {
  const num = (v: number | "", fallback = 0) => (v === "" ? fallback : v);
  return {
    income: num(data.income),
    loanAmount: num(data.loanAmount),
    creditScore: num(data.creditScore, 320),
    loanTerm: num(data.loanTerm, 12),
    employmentStatus: data.employmentStatus,
    education: data.education,
    coapplicantIncome: num(data.coapplicantIncome),
    savings: num(data.savings),
    collateralValue: num(data.collateralValue),
    existingLoans: num(data.existingLoans),
    dependents: num(data.dependents),
    age: num(data.age, 18),
    employerCategory: data.employerCategory,
    loanPurpose: data.loanPurpose,
    propertyArea: data.propertyArea,
  };
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="group block">
      <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <div className="relative">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-sm outline-none transition-all duration-200 focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/15 hover:bg-card";

export function PredictionForm({ onSubmit, loading }: Props) {
  const [data, setData] = useState<FormState>(initial);
  const [advanced, setAdvanced] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const setNumeric = (k: NumericKey, raw: string) => {
    set(k, parseNumericInput(raw) as FormState[typeof k]);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(toPredictInput(data));
      }}
      className="glass relative rounded-3xl p-6 sm:p-8 shadow-elegant"
    >
      <div className="mb-6 flex items-center gap-2 text-xs font-medium text-primary">
        <Sparkles className="h-3.5 w-3.5" /> Loan Eligibility
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        Tell us a bit about your finances
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We'll instantly estimate your approval odds with clear, rule-based insights.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Monthly income" icon={DollarSign}>
          <input
            type="number"
            min={15000}
            max={500000}
            value={data.income}
            onChange={(e) => setNumeric("income", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Loan amount" icon={Wallet}>
          <input
            type="number"
            min={50000}
            max={15000000}
            value={data.loanAmount}
            onChange={(e) => setNumeric("loanAmount", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field
          label={`Credit score · ${data.creditScore === "" ? "—" : data.creditScore}`}
          icon={Gauge}
        >
          <input
            type="range"
            min={320}
            max={850}
            value={data.creditScore === "" ? 320 : data.creditScore}
            onChange={(e) => setNumeric("creditScore", e.target.value)}
            className="w-full accent-[color:var(--color-primary)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>320</span>
            <span>575</span>
            <span>850</span>
          </div>
        </Field>

        <Field
          label={`Loan term · ${data.loanTerm === "" ? "—" : data.loanTerm} months`}
          icon={Calendar}
        >
          <input
            type="range"
            min={12}
            max={360}
            step={6}
            value={data.loanTerm === "" ? 12 : data.loanTerm}
            onChange={(e) => setNumeric("loanTerm", e.target.value)}
            className="w-full accent-[color:var(--color-primary)]"
          />
        </Field>

        <Field label="Employment status" icon={Briefcase}>
          <select
            value={data.employmentStatus}
            onChange={(e) => set("employmentStatus", e.target.value)}
            className={inputCls}
          >
            <option value="employed">Employed / Salaried</option>
            <option value="self-employed">Self-employed</option>
            <option value="contract">Contract</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
          </select>
        </Field>

        <Field label="Education" icon={GraduationCap}>
          <select
            value={data.education}
            onChange={(e) => set("education", e.target.value)}
            className={inputCls}
          >
            <option value="graduate">Graduate</option>
            <option value="undergraduate">Not graduate / Undergraduate</option>
            <option value="highschool">High school</option>
          </select>
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setAdvanced((a) => !a)}
        className="mt-8 flex w-full items-center justify-between rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm font-medium hover:bg-card transition-colors"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Additional details for better accuracy
        </span>
        <motion.span animate={{ rotate: advanced ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {advanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Co-applicant income" icon={DollarSign}>
                <input
                  type="number"
                  min={0}
                  value={data.coapplicantIncome}
                  onChange={(e) => setNumeric("coapplicantIncome", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Savings" icon={Wallet}>
                <input
                  type="number"
                  min={0}
                  value={data.savings}
                  onChange={(e) => setNumeric("savings", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Collateral value" icon={Home}>
                <input
                  type="number"
                  min={0}
                  value={data.collateralValue}
                  onChange={(e) => setNumeric("collateralValue", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Existing loans" icon={Wallet}>
                <input
                  type="number"
                  min={0}
                  value={data.existingLoans}
                  onChange={(e) => setNumeric("existingLoans", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Dependents" icon={Users}>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={data.dependents}
                  onChange={(e) => setNumeric("dependents", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Age" icon={Users}>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={data.age}
                  onChange={(e) => setNumeric("age", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Employer category" icon={Building2}>
                <select
                  value={data.employerCategory}
                  onChange={(e) => set("employerCategory", e.target.value)}
                  className={inputCls}
                >
                  <option value="private">Private</option>
                  <option value="public">Public sector</option>
                  <option value="government">Government</option>
                  <option value="startup">Startup / Other</option>
                  <option value="freelance">Freelance / Other</option>
                </select>
              </Field>
              <Field label="Loan purpose" icon={Sparkles}>
                <select
                  value={data.loanPurpose}
                  onChange={(e) => set("loanPurpose", e.target.value)}
                  className={inputCls}
                >
                  <option value="personal">Personal</option>
                  <option value="home">Home</option>
                  <option value="auto">Auto / Car</option>
                  <option value="education">Education</option>
                  <option value="business">Business</option>
                </select>
              </Field>
              <Field label="Property area" icon={Home}>
                <select
                  value={data.propertyArea}
                  onChange={(e) => set("propertyArea", e.target.value)}
                  className={inputCls}
                >
                  <option value="urban">Urban</option>
                  <option value="semiurban">Semi-urban</option>
                  <option value="rural">Rural</option>
                </select>
              </Field>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        disabled={loading}
        type="submit"
        className="mt-8 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-opacity hover:opacity-95 disabled:opacity-60"
      >
        {loading ? "Analyzing…" : "Predict Loan Approval"}
      </motion.button>
    </form>
  );
}
