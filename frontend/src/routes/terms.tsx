import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — Credexa" },
      { name: "description", content: "The terms that govern your use of Credexa." },
    ],
  }),
});

function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-5xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: May 19, 2026</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">1. Acceptance</h2>
          <p className="mt-2">
            By accessing Credexa you agree to these terms. If you do not agree, please do not use
            the service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">2. Nature of predictions</h2>
          <p className="mt-2">
            Credexa provides AI-generated estimations of loan approval likelihood for informational
            purposes only. Predictions are not financial advice and do not constitute a lending
            offer or guarantee from any institution.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">3. Acceptable use</h2>
          <p className="mt-2">
            You agree not to misuse the platform, attempt to reverse-engineer the model, or submit
            data on behalf of third parties without their consent.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">4. Intellectual property</h2>
          <p className="mt-2">
            All branding, code, and model artifacts remain the property of Credexa and its
            contributors.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">5. Liability</h2>
          <p className="mt-2">
            Credexa is provided “as is” without warranties of any kind. We are not liable for any
            financial decision made based on a prediction.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">6. Contact</h2>
          <p className="mt-2">
            For questions regarding these terms, contact{" "}
            <a className="text-primary hover:underline" href="mailto:ashishligade.tech@gmail.com">
              ashishligade.tech@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
}
