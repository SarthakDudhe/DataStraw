import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Loader2, RefreshCw } from 'lucide-react';
import { getIncidents, updateIncident } from '../services/ticketApi';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import { useToast } from '../components/common/Toast';

const statusStyles = {
  Investigating: 'bg-rose-50 border-rose-200 text-rose-700',
  Monitoring: 'bg-amber-50 border-amber-200 text-amber-700',
  Resolved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const { showToast } = useToast();

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const results = await getIncidents();
      setIncidents(Array.isArray(results) ? results : []);
    } catch (error) {
      showToast(error.message || 'Unable to load incidents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadIncidents(); }, []);

  const advanceIncident = async (incident) => {
    const nextStatus = incident.status === 'Investigating' ? 'Monitoring' : 'Resolved';
    setUpdating(incident.incident_id);
    try {
      await updateIncident(incident.incident_id, { status: nextStatus });
      showToast(`${incident.incident_id} moved to ${nextStatus}`, 'success');
      await loadIncidents();
    } catch (error) {
      showToast(error.message || 'Unable to update incident', 'error');
    } finally {
      setUpdating('');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Incidents" description="Clustered customer problems that deserve one coordinated response." action={<button type="button" className="ops-icon-button" onClick={loadIncidents} title="Refresh incidents"><RefreshCw className="h-4 w-4" /></button>} />
      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-cyan-700" /></div> : incidents.length === 0 ? <div className="ops-panel flex flex-col items-center px-6 py-16 text-center"><AlertTriangle className="h-7 w-7 text-slate-400" /><h2 className="mt-3 text-sm font-semibold text-slate-800">No active incidents</h2><p className="mt-1 text-xs text-slate-500">When related tickets arrive, Deskline groups them here for coordinated handling.</p></div> : <div className="space-y-3">{incidents.map((incident) => <section key={incident.incident_id} className="ops-panel p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><span className="font-mono text-xs font-semibold text-cyan-700">{incident.incident_id}</span><span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyles[incident.status]}`}>{incident.status}</span></div><h2 className="mt-2 text-base font-semibold text-slate-900">{incident.title}</h2><p className="mt-1 text-xs text-slate-500">{incident.ticket_count} linked customer {incident.ticket_count === 1 ? 'ticket' : 'tickets'}</p>{incident.public_update && <p className="mt-3 rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">{incident.public_update}</p>}</div>{incident.status !== 'Resolved' && <Button variant="secondary" disabled={updating === incident.incident_id} onClick={() => advanceIncident(incident)}>{updating === incident.incident_id ? <Loader2 className="h-4 w-4 animate-spin" /> : incident.status === 'Investigating' ? <Clock3 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}<span>{incident.status === 'Investigating' ? 'Start monitoring' : 'Resolve incident'}</span></Button>}</div></section>)}</div>}
    </div>
  );
};

export default Incidents;
