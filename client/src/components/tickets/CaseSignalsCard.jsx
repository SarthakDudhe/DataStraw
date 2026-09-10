import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  BookOpen, 
  Copy, 
  Gauge, 
  Layers3, 
  Loader2, 
  ThumbsUp, 
  ChevronDown, 
  ChevronUp, 
  Check 
} from 'lucide-react';
import { getKnowledgeSuggestions, getTicketImpact, incrementArticleHelpful } from '../../services/ticketApi';
import { useToast } from '../common/Toast';

const impactStyles = {
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Moderate: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Normal: 'bg-slate-100 text-slate-600 border-slate-200',
};

const CaseSignalsCard = ({ ticket, onTicketUpdated }) => {
  const [impact, setImpact] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState(null);
  const [helpfulVoted, setHelpfulVoted] = useState({});
  const { showToast } = useToast();

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

  const handleHelpfulClick = async (slug, e) => {
    e.stopPropagation();
    if (helpfulVoted[slug]) return;

    try {
      await incrementArticleHelpful(slug);
      setHelpfulVoted((prev) => ({ ...prev, [slug]: true }));
      setArticles((prev) =>
        prev.map((art) => (art.slug === slug ? { ...art, helpful_count: (art.helpful_count || 0) + 1 } : art))
      );
      showToast('Article marked as helpful for this case.', 'success');
    } catch {
      showToast('Unable to record helpful vote.', 'error');
    }
  };

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

      {/* Customer Impact Breakdown */}
      {impact && (
        <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Customer impact</span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${impactStyles[impact.level] || impactStyles.Normal}`}>{impact.level} {impact.score}/100</span>
          </div>
          <p className="mt-2 text-xs text-slate-600">{impact.factors.length ? impact.factors.join(' · ') : 'No elevated impact signals detected.'}</p>
        </div>
      )}

      {/* Linked Incident / Duplicate Signal */}
      {(incidentId || duplicates.length > 0) && (
        <div className="rounded-md border border-amber-100 bg-amber-50/60 p-3">
          <div className="flex items-center gap-2 text-amber-800">
            {incidentId ? <Layers3 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="text-xs font-semibold">{incidentId ? `Linked to incident ${incidentId}` : 'Potential duplicate conversations'}</span>
          </div>
          {!incidentId && (
            <p className="mt-2 text-xs text-amber-800/80">
              {duplicates.slice(0, 2).map((item) => `${item.ticket_id} (${item.confidence}%)`).join(' · ')}
            </p>
          )}
        </div>
      )}

      {/* Suggested Knowledge Guidance */}
      {articles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-700" />
              <span className="text-xs font-semibold">Suggested knowledge</span>
            </div>
            <span className="text-[11px] text-slate-400">Approved context</span>
          </div>

          <div className="space-y-2">
            {articles.map((article) => {
              const isExpanded = expandedSlug === article.slug;
              const isVoted = helpfulVoted[article.slug];

              return (
                <div
                  key={article.slug}
                  className="rounded-md border border-slate-100 bg-white p-3 space-y-2 transition-colors"
                >
                  <div
                    className="flex items-start justify-between gap-2 cursor-pointer select-none"
                    onClick={() => setExpandedSlug(isExpanded ? null : article.slug)}
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 hover:text-cyan-700 transition-colors">
                        {article.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                        {article.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                      aria-label={isExpanded ? 'Collapse guidance' : 'Expand guidance'}
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Content View */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-md leading-relaxed whitespace-pre-wrap">
                      {article.content}
                    </div>
                  )}

                  {/* Card Actions: Helpful Button */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      {article.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleHelpfulClick(article.slug, e)}
                      disabled={isVoted}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                        isVoted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Confirm this approved guidance is helpful for this ticket"
                    >
                      {isVoted ? <Check className="h-3 w-3" /> : <ThumbsUp className="h-3 w-3" />}
                      <span>{isVoted ? 'Helpful' : 'Mark helpful'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && duplicates.length > 0 && !incidentId && (
        <div className="flex items-start gap-2 rounded-md bg-slate-50 p-2.5 text-[11px] text-slate-500">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          Review the overlap before merging customer communication.
        </div>
      )}
    </section>
  );
};

export default CaseSignalsCard;
