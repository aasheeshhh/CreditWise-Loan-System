import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Credexa" },
      { name: "description", content: "How Credexa handles your data and protects your privacy." },
    ],
  }),
});

function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-5xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: May 19, 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">1. Overview</h2>
          <p className="mt-2">
            Credexa is an AI-powered loan approval prediction platform. We respect your privacy and
            are committed to protecting the information you share with us. This policy explains what
            we collect, how we use it, and the choices you have.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">2. Information we process</h2>
          <p className="mt-2">
            To generate a prediction, we process the financial and personal inputs you provide
            (e.g. income, credit score, employment status, loan amount). These values are processed
            transiently in memory and are not persisted to a database.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">3. How we use information</h2>
          <p className="mt-2">
            Inputs are used solely to compute a loan approval probability and the corresponding
            explainability output (SHAP feature contributions). We do not sell or share your data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">4. Cookies & analytics</h2>
          <p className="mt-2">
            Credexa uses minimal cookies required for theme preference and session continuity. No
            third-party advertising trackers are deployed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">5. Your rights</h2>
          <p className="mt-2">
            Since we do not store personal inputs, there is typically nothing to delete. For any
            privacy concerns, reach out at{" "}
            <a className="text-primary hover:underline" href="mailto:ashishligade.tech@gmail.com">
              ashishligade.tech@gmail.com
            </a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">6. Contact</h2>
          <p className="mt-2">
            Questions about this policy? Email{" "}
            <a className="text-primary hover:underline" href="mailto:ashishligade.tech@gmail.com">
              ashishligade.tech@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
}
