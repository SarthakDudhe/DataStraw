import React, { useState } from 'react';
import { Sparkles, MessageSquare, Check, Wand2 } from 'lucide-react';
import { generateSmartReply } from '../../utils/aiCopilot';

const AiReplyAssistant = ({ ticket, onInsertReply }) => {
  const [replyType, setReplyType] = useState('investigating');
  const [tone, setTone] = useState('professional');
  const [showOptions, setShowOptions] = useState(false);

  const handleApply = (typeToApply) => {
    const activeType = typeToApply || replyType;
    const generated = generateSmartReply(ticket, activeType, tone);
    onInsertReply(generated);
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
          <span>AI Smart Reply</span>
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
          <span className="text-[11px] text-zinc-400 font-medium block">
            Select response intent to draft into note:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setReplyType('investigating');
                handleApply('investigating');
              }}
              className="p-2 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 text-left transition-all group"
            >
              <div className="font-semibold text-zinc-200 group-hover:text-blue-400">
                Investigating
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Confirming review & active investigation
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setReplyType('resolved');
                handleApply('resolved');
              }}
              className="p-2 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all group"
            >
              <div className="font-semibold text-zinc-200 group-hover:text-emerald-400">
                Fix Deployed
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Issue resolved; request user test
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setReplyType('need_info');
                handleApply('need_info');
              }}
              className="p-2 rounded-md bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="font-semibold text-zinc-200 group-hover:text-amber-400">
                Need More Info
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Politely request screenshots & steps
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiReplyAssistant;
