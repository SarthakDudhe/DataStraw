import React, { useEffect, useState } from 'react';
import { AlertTriangle, BookOpen, Copy, Gauge, Layers3, Loader2 } from 'lucide-react';
import { getKnowledgeSuggestions, getTicketImpact } from '../../services/ticketApi';

const impactStyles = {
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Moderate: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Normal: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CaseSignalsCard = ({ ticket }) => {
  const [impact, setImpact] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const ticketId = ticket?.ticket_id || ticket?.id;
    if (!ticketId) return undefined;

    Promise.all([
      getTicketImpact(ticketId).catch(() => null),
      getKnowledgeSuggestions({ subject: ticket.subject, description: ticket.description }).catch(() => []),
    ]).then(([impactResult, articleResults]) => {
      if (!active) return;
      setImpact(impactResult?.impact || null);
      setArticles(Array.isArray(articleResults) ? articleResults : []);
      setLoading(false);
    });

    return () => { active = false; };
  }, [ticket?.ticket_id, ticket?.id, ticket?.subject, ticket?.description]);

  const duplicates = ticket?.potential_duplicates || [];
  const incidentId = ticket?.incident_id;
  const isEmpty = !loading && !impact && !articles.length && !duplicates.length && !incidentId;
  if (isEmpty) return null;

  return (
    <section className="ops-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-cyan-700" />
          <h2 className="text-sm font-semibold text-slate-900">Case signals</h2>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
      </div>

      {impact && (
        <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Customer impact</span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${impactStyles[impact.level] || impactStyles.Normal}`}>{impact.level} {impact.score}/100</span>
          </div>
          <p className="mt-2 text-xs text-slate-600">{impact.factors.length ? impact.factors.join(' · ') : 'No elevated impact signals detected.'}</p>
        </div>
      )}

      {(incidentId || duplicates.length > 0) && (
        <div className="rounded-md border border-amber-100 bg-amber-50/60 p-3">
          <div className="flex items-center gap-2 text-amber-800">
            {incidentId ? <Layers3 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="text-xs font-semibold">{incidentId ? `Linked to incident ${incidentId}` : 'Potential duplicate conversations'}</span>
          </div>
          {!incidentId && <p className="mt-2 text-xs text-amber-800/80">{duplicates.slice(0, 2).map((item) => `${item.ticket_id} (${item.confidence}%)`).join(' · ')}</p>}
        </div>
      )}

      {articles.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2 text-slate-700"><BookOpen className="h-4 w-4 text-cyan-700" /><span className="text-xs font-semibold">Suggested knowledge</span></div>
          <div className="space-y-2">
            {articles.map((article) => <div key={article.slug} className="rounded-md border border-slate-100 bg-white p-2.5"><p className="text-xs font-semibold text-slate-700">{article.title}</p><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{article.summary}</p></div>)}
          </div>
        </div>
      )}

      {!loading && duplicates.length > 0 && !incidentId && <div className="flex items-start gap-2 rounded-md bg-slate-50 p-2.5 text-[11px] text-slate-500"><AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />Review the overlap before merging customer communication.</div>}
    </section>
  );
};

export default CaseSignalsCard;
