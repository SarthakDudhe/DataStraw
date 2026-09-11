import React, { useState } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard, 
  KeyRound, 
  Code2, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

const TRACKS = [
  {
    id: 'billing',
    title: 'Payment & Checkout Decline',
    icon: CreditCard,
    description: 'Diagnose card rejections, 3DS authentication failures, and uncaptured charges.',
    steps: [
      {
        title: 'International E-Commerce Switch',
        instruction: 'Open your mobile banking app and ensure "International & Online Transactions" is toggled ON with a sufficient limit.',
        hint: 'Most card issuers disable international e-commerce by default for fraud prevention.',
      },
      {
        title: 'Telecom SMS & Shortcode Filter',
        instruction: 'Check that your phone is receiving automated SMS shortcodes and that "Do Not Disturb" is not filtering bank verification OTPs.',
        hint: '3D Secure OTPs are sent via carrier shortcodes (e.g. 5-digit numbers).',
      },
      {
        title: 'Billing Zip / Postal Code Verification',
        instruction: 'Ensure the billing postal code you entered matches the exact billing address registered on your card statement.',
        hint: 'AVS (Address Verification Service) will reject transactions on a postal code mismatch.',
      },
    ],
  },
  {
    id: 'auth',
    title: 'Login, 2FA & Session Lockout',
    icon: KeyRound,
    description: 'Resolve session token errors, authenticator code mismatch, and account lockouts.',
    steps: [
      {
        title: 'Bypass Stale Session Cache',
        instruction: 'Open a private / incognito browser window and attempt sign-in to bypass corrupted local storage or stale JWT cookies.',
        hint: 'Cached tokens can cause repeated redirect loops.',
      },
      {
        title: 'Authenticator Clock Drift Synchronization',
        instruction: 'In Google Authenticator or Microsoft Authenticator, go to Settings → Time correction for codes → Sync now.',
        hint: 'A system clock difference of just 30 seconds causes all TOTP codes to be rejected.',
      },
      {
        title: 'Single-Use Recovery Magic Link',
        instruction: 'Use the "Forgot Password" link on the sign-in page to generate an emergency sign-in email link valid for 15 minutes.',
        hint: 'Check your spam or promotions folder if the link does not appear in your inbox.',
      },
    ],
  },
  {
    id: 'api',
    title: 'API & Webhook Integration Errors',
    icon: Code2,
    description: 'Troubleshoot HTTP 401, 429 rate limiting, and webhook delivery timeouts.',
    steps: [
      {
        title: 'Bearer Authorization Header Format',
        instruction: 'Ensure your HTTP request header is exactly formatted as `Authorization: Bearer <YOUR_API_KEY>` without quotes.',
        hint: 'Missing the "Bearer " prefix is the most common cause of HTTP 401 Unauthorized.',
      },
      {
        title: 'Rate Limit (100 req/min) Backoff Check',
        instruction: 'Inspect the `X-RateLimit-Remaining` and `Retry-After` response headers when handling HTTP 429 status codes.',
        hint: 'Implement exponential backoff with jitter in your SDK or API client.',
      },
      {
        title: 'Webhook 5-Second SLA Response',
        instruction: 'Verify your webhook receiver endpoint responds with an immediate HTTP 200 OK before processing heavy background jobs.',
        hint: 'Webhooks time out after 5000ms and enter exponential retry queues.',
      },
    ],
  },
];

export const DiagnosticWizard = ({ onResolved, onEscalateToTicket }) => {
  const [selectedTrack, setSelectedTrack] = useState(TRACKS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSelfResolved, setIsSelfResolved] = useState(false);

  const currentTrack = selectedTrack;
  const currentStep = currentTrack.steps[currentStepIndex];

  const handleStepDone = (fixed) => {
    if (fixed) {
      setIsSelfResolved(true);
      if (onResolved) onResolved(currentTrack.title);
      return;
    }

    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps([...completedSteps, currentStepIndex]);
    }

    if (currentStepIndex < currentTrack.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleEscalate = () => {
    const diagnosticSummary = `[Auto Diagnostic Wizard Log]\nTrack: ${currentTrack.title}\n` +
      currentTrack.steps
        .map((s, idx) => `• Step ${idx + 1} (${s.title}): Verified by customer — Issue persists`)
        .join('\n') +
      '\n\nAdditional Details:\n';

    if (onEscalateToTicket) {
      onEscalateToTicket({
        subject: `${currentTrack.title} (Diagnostic Completed)`,
        description: diagnosticSummary,
      });
    }
  };

  const handleReset = (track) => {
    setSelectedTrack(track || selectedTrack);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setIsSelfResolved(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shadow-xs">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Interactive Self-Diagnostic Wizard
            </h3>
            <p className="text-[11px] text-slate-500">
              Step-by-step guided troubleshooting for common technical & billing issues.
            </p>
          </div>
        </div>
        <span className="ops-label text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 text-[10px] hidden sm:inline-block">
          Guided Resolver
        </span>
      </div>

      {/* Track Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
        {TRACKS.map((t) => {
          const Icon = t.icon;
          const isSelected = t.id === selectedTrack.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleReset(t)}
              className={`p-3 text-left rounded-lg border transition-all ${
                isSelected
                  ? 'bg-cyan-50/70 border-cyan-300 text-cyan-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-700' : 'text-slate-500'}`} />
                <span className="text-xs font-bold leading-tight truncate">
                  {t.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                {t.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Wizard Area */}
      {isSelfResolved ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center animate-fadeIn">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-300">
            <Check className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            Issue Resolved Successfully!
          </h4>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
            You verified and fixed your inquiry with the guided checklist. No waiting on support queues!
          </p>
          <button
            type="button"
            onClick={() => handleReset()}
            className="mt-4 px-3.5 py-1.5 bg-[#142a43] text-white rounded-lg text-xs font-semibold hover:bg-[#203a58] transition-colors"
          >
            Start Another Diagnosis
          </button>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
          {/* Step Progress Indicators */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <span className="ops-label text-slate-600 text-[10px]">
              Step {currentStepIndex + 1} of {currentTrack.steps.length}: {currentStep.title}
            </span>
            <div className="flex items-center gap-1">
              {currentTrack.steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-5 h-1.5 rounded-full transition-all ${
                    i === currentStepIndex
                      ? 'bg-cyan-600 w-8'
                      : completedSteps.includes(i)
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {currentStepIndex + 1}
                </span>
                <span>{currentStep.title}</span>
              </h4>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed pl-7">
                {currentStep.instruction}
              </p>
              <div className="mt-3 ml-7 p-2 rounded bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-mono">
                {currentStep.hint}
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <span className="text-xs font-semibold text-slate-700">
                Did completing this step resolve your problem?
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepDone(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Yes, It Fixed It!</span>
                </button>

                {currentStepIndex < currentTrack.steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => handleStepDone(false)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span>Next Step &rarr;</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEscalate}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#142a43] text-white hover:bg-[#203a58] transition-colors shadow-xs"
                  >
                    <span>Still Broken &bull; Escalate to Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticWizard;
