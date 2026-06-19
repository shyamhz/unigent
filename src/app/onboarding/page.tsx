"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@clerk/nextjs";
import { getConnectUrl } from "@/server/actions/corsair";
import { SignOutLink } from "@/client/components/sign-out-link";

type Step = "welcome" | "connect" | "connect-calendar" | "complete";
type Status = "idle" | "loading" | "error";

function OnboardingContent() {
  const [step, setStep] = useState<Step>("welcome");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const { session } = useSession();
  const handledRef = useRef(false);

  const goToDashboard = useCallback(async () => {
    // Force a token refresh so the JWT cookie picks up the new metadata
    try {
      await session?.getToken({ skipCache: true });
    } catch {
      // ignore
    }
    // Give the browser time to persist the updated cookie
    await new Promise((r) => setTimeout(r, 300));
    window.location.replace("/dashboard");
  }, [session]);

  // Handle OAuth callback return (?connected=true, ?step=connect-calendar, or ?error=...)
  useEffect(() => {
    if (handledRef.current) return;
    const connected = searchParams.get("connected");
    const stepParam = searchParams.get("step");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      setError(
        oauthError === "access_denied"
          ? "You declined access. Please try again."
          : "Connection failed. Please try again."
      );
      setStep("connect");
      return;
    }

    if (connected === "true") {
      handledRef.current = true;
      setStatus("loading");
      goToDashboard();
    } else if (stepParam === "connect-calendar") {
      // Gmail connected, now connect Calendar
      handledRef.current = true;
      setStep("connect-calendar");
    }
  }, [searchParams, goToDashboard]);

  // Step 1 → Step 2
  const handleGetStarted = () => setStep("connect");

  // Step 2: Connect Gmail with Google
  const handleConnectGmail = async () => {
    setStatus("loading");
    setError("");

    try {
      const url = await getConnectUrl();
      if (!url) throw new Error("Failed to generate connect URL");
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect. Please try again."
      );
      setStatus("idle");
    }
  };

  // Step 2b: Connect Calendar with Google
  const handleConnectCalendar = async () => {
    setStatus("loading");
    setError("");

    try {
      const url = await getConnectUrl();
      if (!url) throw new Error("Failed to generate connect URL");
      window.location.href = url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect. Please try again."
      );
      setStatus("idle");
    }
  };

  // Step 2: Skip — mark onboarded, then go to dashboard
  const handleSkip = async () => {
    setStatus("loading");
    try {
      await fetch("/api/user/onboarded", { method: "POST" });
    } catch {
      // ignore
    }
    goToDashboard();
  };

  // Step 3: Go to Dashboard
  const handleGoToDashboard = () => {
    setStatus("loading");
    goToDashboard();
  };

  const steps = [
    { id: "welcome", label: "Welcome" },
    { id: "connect", label: "Connect" },
    { id: "connect-calendar", label: "Calendar" },
    { id: "complete", label: "Done" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <span className="text-sm font-semibold text-primary">Unigent</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  step === s.id
                    ? "bg-primary text-primary-foreground"
                    : currentIdx > i
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentIdx > i ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 transition-colors ${
                    currentIdx > i ? "bg-primary/40" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-8">
          {/* Step 1: Welcome */}
          {step === "welcome" && (
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h1 className="mb-3 text-2xl font-semibold text-foreground">
                Welcome to Unigent
              </h1>
              <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                Your AI agent workspace is ready. Connect your Gmail and Google
                Calendar to start automating tasks with natural language commands.
              </p>
              <button
                onClick={handleGetStarted}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Step 2: Connect */}
          {step === "connect" && (
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>
              <h1 className="mb-3 text-2xl font-semibold text-foreground">
                Connect your accounts
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Grant Unigent access to your Gmail and Google Calendar. This
                allows the agent to read, send, and manage emails and events on
                your behalf.
              </p>

              {/* Permissions List */}
              <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4 text-left">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Required permissions
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[rgba(216,90,48,0.14)]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#E2683E"
                        strokeWidth="2.5"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Gmail
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Read, send, and manage your emails
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[rgba(55,138,221,0.14)]">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4C97E0"
                        strokeWidth="2.5"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Google Calendar
                      </p>
                      <p className="text-xs text-muted-foreground">
                        View, create, and update your events
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                onClick={handleConnectGmail}
                disabled={status === "loading"}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  "Connect Gmail"
                )}
              </button>

              <button
                onClick={handleSkip}
                disabled={status === "loading"}
                className="mt-3 w-full rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 2b: Connect Calendar */}
          {step === "connect-calendar" && (
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h1 className="mb-3 text-2xl font-semibold text-foreground">
                Connect Google Calendar
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Gmail is connected! Now grant access to your Google Calendar so
                the agent can manage your events.
              </p>

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                onClick={handleConnectCalendar}
                disabled={status === "loading"}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  "Connect Calendar"
                )}
              </button>

              <button
                onClick={handleSkip}
                disabled={status === "loading"}
                className="mt-3 w-full rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === "complete" && (
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2ECC8F"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="mb-3 text-2xl font-semibold text-foreground">
                You&apos;re all set
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Your workspace is ready. Head to the dashboard and start
                automating with natural language commands.
              </p>

              {/* Free Tier Info */}
              <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4 text-left">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Free tier
                </p>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>20 emails/day</p>
                  <p>15 calendar events/day</p>
                  <p>AI support — Pro only</p>
                </div>
              </div>

              <button
                onClick={handleGoToDashboard}
                disabled={status === "loading"}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "Redirecting..." : "Go to Dashboard"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <SignOutLink />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
