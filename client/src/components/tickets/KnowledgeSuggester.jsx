import React, { useState, useEffect } from 'react';
import { BookOpen, Check, ArrowRight, Sparkles, ExternalLink, ThumbsUp } from 'lucide-react';
import { getKnowledgeSuggestions } from '../../services/ticketApi';

export const KnowledgeSuggester = ({ ticket, onInsertSolution }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSuggestions = async () => {
      if (!ticket?.subject && !ticket?.description) return;
      setLoading(true);
      try {
        const results = await getKnowledgeSuggestions({
          subject: ticket.subject,
          description: ticket.description,
        });
        if (isMounted) {
          setSuggestions(Array.isArray(results) ? results : []);
          if (results.length > 0) {
            setExpandedSlug(results[0].slug);
          }
        }
      } catch {
        if (isMounted) setSuggestions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSuggestions();
    return () => {
      isMounted = false;
    };
  }, [ticket?.subject, ticket?.description]);

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="ops-panel p-4 bg-slate-50/70 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#142a43] text-white flex items-center justify-center shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="ops-label text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100 text-[10px]">
                Backend KB Match
              </span>
              <span className="text-xs font-bold text-slate-900">
                Verified Knowledge Solutions
              </span>
            </div>
          </div>
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          {suggestions.length} article{suggestions.length > 1 ? 's' : ''} matched
        </span>
      </div>

      {/* Suggested Articles List */}
      <div className="space-y-2.5">
        {suggestions.map((article) => {
          const isExpanded = expandedSlug === article.slug;

          return (
            <div
              key={article.slug}
              className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {article.tags?.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1">
                    {article.title}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => onInsertSolution(article.content || article.summary)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#142a43] hover:bg-[#203a58] transition-colors shadow-2xs shrink-0"
                  title="Insert solution into reply textarea"
                >
                  <Check className="w-3 h-3" />
                  <span>Use Solution</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                {article.summary || article.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KnowledgeSuggester;
