import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Zap, Check, RotateCw, Loader2 } from 'lucide-react';
import { aiSummarizeTicket } from '../../services/ticketApi';
import { generateTicketSummary } from '../../utils/aiCopilot';

const AiTicketSummarizer = ({ ticket }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLiveGemini, setIsLiveGemini] = useState(false);
  const [summaryData, setSummaryData] = useState(() => generateTicketSummary(ticket));

  const fetchGeminiSummary = async () => {
    if (!ticket) return;
    setLoading(true);

    try {
      const res = await aiSummarizeTicket({
        subject: ticket.subject,
        description: ticket.description,
        customer_name: ticket.customer_name || ticket.customerName,
      });

      if (res?.success && res?.summary) {
        setSummaryData({
          coreProblem: res.summary.coreProblem,
          sentiment: res.summary.sentiment,
          nextStep: res.summary.nextStep,
          sentimentColor: res.summary.sentiment?.toLowerCase().includes('urgent') || res.summary.sentiment?.toLowerCase().includes('high')
            ? 'text-red-400 bg-red-500/10 border-red-500/20'
            : res.summary.sentiment?.toLowerCase().includes('constructive')
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        });
        setIsLiveGemini(true);
      }
    } catch {
      // Graceful fallback to local heuristic engine
      setSummaryData(generateTicketSummary(ticket));
      setIsLiveGemini(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeminiSummary();
  }, [ticket?.ticket_id, ticket?.id]);

  if (!ticket) return null;

  const handleCopySummary = () => {
    const text = `Issue: ${summaryData.coreProblem}\nSentiment: ${summaryData.sentiment}\nAction: ${summaryData.nextStep}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-cyan-200 rounded-lg p-4 shadow-sm relative overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-cyan-700 flex items-center justify-center text-white shadow-sm">
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                AI case brief
              </h3>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isLiveGemini 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-cyan-50 text-cyan-700 border-cyan-200'
              }`}>
                {isLiveGemini ? 'Live model' : 'Local assist'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {loading ? 'Synthesizing diagnosis with Gemini AI...' : 'Instant root-cause analysis and recommended next action'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={fetchGeminiSummary}
            disabled={loading}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Re-analyze with Gemini AI"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-700' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-[11px] text-slate-600 border border-slate-200 transition-colors"
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
            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label={isOpen ? 'Collapse AI summary' : 'Expand AI summary'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isOpen && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* Core Problem */}
          <div className="p-3 bg-slate-50 rounded-md border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Key Diagnosis
            </span>
            <p className="text-slate-700 leading-relaxed text-xs">
              {loading ? (
                <span className="inline-block w-full h-10 bg-slate-200 rounded animate-pulse"></span>
              ) : (
                summaryData.coreProblem
              )}
            </p>
          </div>

          {/* Customer Sentiment */}
          <div className="p-3 bg-slate-50 rounded-md border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Customer Sentiment
            </span>
            <div className="pt-0.5">
              {loading ? (
                <span className="inline-block w-24 h-5 bg-slate-200 rounded animate-pulse"></span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${summaryData.sentimentColor || 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {summaryData.sentiment}
                </span>
              )}
            </div>
          </div>

          {/* Recommended Action */}
          <div className="p-3 bg-slate-50 rounded-md border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 text-cyan-700">
              <Zap className="w-3 h-3" />
              <span>Recommended Next Action</span>
            </span>
            <p className="text-slate-700 leading-relaxed text-xs">
              {loading ? (
                <span className="inline-block w-full h-10 bg-slate-200 rounded animate-pulse"></span>
              ) : (
                summaryData.nextStep
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTicketSummarizer;
