import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowUpRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { getTickets } from '../../services/ticketApi';
import StatusBadge from './StatusBadge';
import { formatDate } from '../../utils/formatDate';

const CustomerHistoryCard = ({ customerEmail, currentTicketId }) => {
  const [historyTickets, setHistoryTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customerEmail) return;

    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const allTickets = await getTickets({ search: customerEmail.trim() });
        if (isMounted && Array.isArray(allTickets)) {
          // Filter to only match exact email and exclude the current ticket
          const others = allTickets.filter(
            (t) =>
              (t.customer_email || t.customerEmail || '').toLowerCase() === customerEmail.toLowerCase() &&
              (t.ticket_id || t.id) !== currentTicketId
          );
          setHistoryTickets(others);
        }
      } catch {
        if (isMounted) setHistoryTickets([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [customerEmail, currentTicketId]);

  if (!customerEmail) return null;

  const totalHistoryCount = historyTickets.length;
  const isFirstTime = totalHistoryCount === 0 && !loading;

  return (
    <section className="ops-panel p-5 space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-slate-500" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Customer Ticket History
          </h2>
        </div>
        {!loading && (
          <span className="text-[11px] font-mono text-slate-500">
            {totalHistoryCount} prior {totalHistoryCount === 1 ? 'ticket' : 'tickets'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2 py-2 animate-pulse">
          <div className="h-4 bg-zinc-800/50 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-800/40 rounded w-1/2"></div>
        </div>
      ) : isFirstTime ? (
        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-start gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-300">First-time Requester</span>
            <p className="text-slate-500 text-[11px] mt-0.5">
              This is the first support ticket on record from this email.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {historyTickets.map((t) => {
            const id = t.ticket_id || t.id;
            return (
              <Link
                key={id}
                to={`/tickets/${id}`}
                className="block p-2.5 bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 rounded-md transition-all group"
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="font-mono text-xs font-semibold text-cyan-700 transition-colors">
                    #{id}
                  </span>
                  <StatusBadge status={t.status} className="scale-90 origin-right" />
                </div>
                <div className="text-xs font-semibold text-slate-700 truncate group-hover:text-cyan-800">
                  {t.subject}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200">
                  <span>{formatDate(t.created_at || t.createdAt, false)}</span>
                  <span className="text-blue-400 flex items-center gap-0.5 group-hover:underline">
                    <span>Open</span>
                    <ArrowUpRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CustomerHistoryCard;
