import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, ArrowRight, Zap, Check } from 'lucide-react';
import { generateTicketSummary } from '../../utils/aiCopilot';

const AiTicketSummarizer = ({ ticket }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!ticket) return null;

  const summary = generateTicketSummary(ticket);

  const handleCopySummary = () => {
    const text = `Issue: ${summary.coreProblem}\nSentiment: ${summary.sentiment}\nAction: ${summary.nextStep}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-blue-950/20 via-indigo-950/20 to-purple-950/10 border border-blue-500/30 rounded-xl p-4 shadow-subtle relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-100">
                AI Ticket Intelligence
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Copilot
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Instant summary and recommended resolution path
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-[11px] text-zinc-300 border border-zinc-700/60 transition-colors"
            title="Copy summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <span>Copy Brief</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            aria-label={isOpen ? 'Collapse AI summary' : 'Expand AI summary'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isOpen && (
        <div className="mt-4 pt-3.5 border-t border-zinc-800/60 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* Core Problem */}
          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60 space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Key Diagnosis
            </span>
            <p className="text-zinc-200 leading-relaxed text-xs">
              {summary.coreProblem}
            </p>
          </div>

          {/* Customer Sentiment */}
          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60 space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Customer Sentiment
            </span>
            <div className="pt-0.5">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${summary.sentimentColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {summary.sentiment}
              </span>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/60 space-y-1.5">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1 text-blue-400">
              <Zap className="w-3 h-3" />
              <span>Recommended Next Action</span>
            </span>
            <p className="text-zinc-300 leading-relaxed text-xs">
              {summary.nextStep}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTicketSummarizer;
