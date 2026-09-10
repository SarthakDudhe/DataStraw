import React, { useState } from 'react';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { aiGenerateReply } from '../../services/ticketApi';
import { generateSmartReply } from '../../utils/aiCopilot';

const AiReplyAssistant = ({ ticket, onInsertReply }) => {
  const [tone, setTone] = useState('professional');
  const [showOptions, setShowOptions] = useState(false);
  const [generatingType, setGeneratingType] = useState(null);
  const [sources, setSources] = useState([]);

  const handleApply = async (typeToApply) => {
    setGeneratingType(typeToApply);

    try {
      // First attempt live Gemini AI generation from backend
      const res = await aiGenerateReply({
        subject: ticket?.subject,
        description: ticket?.description,
        customer_name: ticket?.customer_name || ticket?.customerName,
        replyType: typeToApply,
        tone: tone,
      });

      if (res?.success && res?.reply) {
        onInsertReply(res.reply);
        setSources(Array.isArray(res.sources) ? res.sources : []);
        return;
      }
    } catch {
      // Graceful fallback to heuristic smart reply generator
    } finally {
      setGeneratingType(null);
    }

    // Fallback template engine
    const fallbackText = generateSmartReply(ticket, typeToApply, tone);
    setSources([]);
    onInsertReply(fallbackText);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowOptions((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors focus:outline-none"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Draft a reply</span>
        </button>

        {showOptions && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Tone:</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-700 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="professional">Professional</option>
              <option value="empathetic">Empathetic</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        )}
      </div>

      {showOptions && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2.5 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-600 font-medium">
              Choose the intent for your draft:
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Assisted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled={generatingType !== null}
              onClick={() => handleApply('investigating')}
              className="p-2.5 rounded-md bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 group-hover:text-cyan-700">
                  Investigating
                </span>
                {generatingType === 'investigating' && (
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-700" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Confirming active review
              </p>
            </button>

            <button
              type="button"
              disabled={generatingType !== null}
              onClick={() => handleApply('resolved')}
              className="p-2.5 rounded-md bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 group-hover:text-emerald-700">
                  Fix Deployed
                </span>
                {generatingType === 'resolved' && (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Issue solved; ask user test
              </p>
            </button>

            <button
              type="button"
              disabled={generatingType !== null}
              onClick={() => handleApply('need_info')}
              className="p-2.5 rounded-md bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 group-hover:text-amber-700">
                  Need More Info
                </span>
                {generatingType === 'need_info' && (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Request error logs & steps
              </p>
            </button>
          </div>

          {sources.length > 0 && (
            <div className="border-t border-slate-200 pt-2.5">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <BookOpen className="h-3.5 w-3.5 text-cyan-700" />
                <span>Grounded in approved knowledge</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sources.map((source) => (
                  <span key={source.slug} className="rounded border border-cyan-100 bg-white px-2 py-1 text-[10px] font-medium text-cyan-800">
                    {source.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiReplyAssistant;
