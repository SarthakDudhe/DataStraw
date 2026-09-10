import React, { useMemo } from 'react';
import { Sparkles, Clock, ShieldAlert, CheckCircle2, Tag } from 'lucide-react';
import { getTicketTags } from '../../utils/tagUtils';
import TagBadge from './TagBadge';

const LiveTriageCard = ({ subject, description }) => {
  const hasContent = Boolean(subject?.trim() || description?.trim());

  const triage = useMemo(() => {
    if (!hasContent) return null;

    const fullText = `${subject || ''} ${description || ''}`.toLowerCase();
    const tags = getTicketTags({ subject, description });

    let priority = 'P3 - Normal';
    let priorityColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    let slaTarget = '12 Hours';

    // Critical keywords
    if (/(urgent|emergency|outage|down|crash|production|security|breach|critical)/i.test(fullText)) {
      priority = 'P1 - Critical';
      priorityColor = 'text-red-400 bg-red-500/10 border-red-500/20';
      slaTarget = '2 Hours';
    } else if (/(fail|broken|error|payment|bill|blocked|login)/i.test(fullText)) {
      priority = 'P2 - High';
      priorityColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      slaTarget = '6 Hours';
    } else if (/(feature|request|suggest|cosmetic|typo)/i.test(fullText)) {
      priority = 'P4 - Low';
      priorityColor = 'text-zinc-400 bg-zinc-800/80 border-zinc-700/60';
      slaTarget = '24 Hours';
    }

    return {
      tags,
      priority,
      priorityColor,
      slaTarget,
    };
  }, [subject, description, hasContent]);

  if (!hasContent || !triage) return null;

  return (
    <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-lg shadow-sm space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-700" />
          <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            Triage suggestion
          </span>
        </div>
        <span className="text-[10px] font-mono text-cyan-700">Live analysis</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {/* Estimated Priority */}
        <div className="p-2.5 bg-white border border-cyan-100 rounded-md space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
            Suggested Priority
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${triage.priorityColor}`}>
            {triage.priority}
          </span>
        </div>

        {/* Expected SLA Target */}
        <div className="p-2.5 bg-white border border-cyan-100 rounded-md space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
            Expected SLA Target
          </span>
          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-700" />
            <span>&lt; {triage.slaTarget}</span>
          </div>
        </div>

        {/* Auto Category Tags */}
        <div className="col-span-2 sm:col-span-1 p-2.5 bg-white border border-cyan-100 rounded-md space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
            Detected Categories
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {triage.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTriageCard;
