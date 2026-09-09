import React, { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { aiGenerateReply } from '../../services/ticketApi';
import { generateSmartReply } from '../../utils/aiCopilot';

const AiReplyAssistant = ({ ticket, onInsertReply }) => {
  const [tone, setTone] = useState('professional');
  const [showOptions, setShowOptions] = useState(false);
  const [generatingType, setGeneratingType] = useState(null);

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
        return;
      }
    } catch {
      // Graceful fallback to heuristic smart reply generator
    } finally {
      setGeneratingType(null);
    }

    // Fallback template engine
    const fallbackText = generateSmartReply(ticket, typeToApply, tone);
    onInsertReply(fallbackText);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowOptions((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors focus:outline-none"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Smart Reply</span>
        </button>

        {showOptions && (
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <span>Tone:</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-0.5 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="professional">Professional</option>
              <option value="empathetic">Empathetic</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        )}
      </div>

      {showOptions && (
        <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-lg space-y-2.5 animate-fadeIn text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">
              Click intent to generate with Gemini AI:
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Gemini 3.6
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled={generatingType !== null}
              onClick={() => handleApply('investigating')}
              className="p-2.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 group-hover:text-blue-400">
                  Investigating
                </span>
                {generatingType === 'investigating' && (
                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Confirming active review
              </p>
            </button>

            <button
              type="button"
              disabled={generatingType !== null}
              onClick={() => handleApply('resolved')}
              className="p-2.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 group-hover:text-emerald-400">
                  Fix Deployed
                </span>
                {generatingType === 'resolved' && (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Issue solved; ask user test
              </p>
            </button>

            <button
              type="button"
              disabled={generatingType !== null}
              onClick={() => handleApply('need_info')}
              className="p-2.5 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 group-hover:text-amber-400">
                  Need More Info
                </span>
                {generatingType === 'need_info' && (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Request error logs & steps
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiReplyAssistant;
