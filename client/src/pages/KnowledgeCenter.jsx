import React, { useEffect, useState } from 'react';
import { BookOpen, Loader2, Plus, Search, X } from 'lucide-react';
import { createKnowledgeArticle, getKnowledgeArticles } from '../services/ticketApi';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import { useToast } from '../components/common/Toast';

const KnowledgeCenter = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', summary: '', content: '', tags: '', keywords: '' });
  const { showToast } = useToast();

  const loadArticles = async (term = search) => {
    setLoading(true);
    try { setArticles(await getKnowledgeArticles(term)); }
    catch (error) { showToast(error.message || 'Unable to load knowledge articles', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadArticles(''); }, []);

  const submit = async (event) => {
    event.preventDefault();
    const slug = form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug || !form.summary.trim() || !form.content.trim()) return showToast('Complete the title, summary, and guidance fields.', 'error');
    setCreating(true);
    try {
      await createKnowledgeArticle({
        slug, title: form.title, summary: form.summary, content: form.content,
        tags: form.tags.split(',').map((value) => value.trim()).filter(Boolean),
        keywords: form.keywords.split(',').map((value) => value.trim()).filter(Boolean),
      });
      setForm({ title: '', summary: '', content: '', tags: '', keywords: '' });
      setShowForm(false);
      showToast('Knowledge article published.', 'success');
      await loadArticles();
    } catch (error) { showToast(error.message || 'Unable to create article', 'error'); }
    finally { setCreating(false); }
  };

  return <div className="space-y-6">
    <PageHeader title="Knowledge center" description="Approved guidance used to help agents solve repeat problems consistently." action={<Button onClick={() => setShowForm((open) => !open)}>{showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}<span>{showForm ? 'Close' : 'New article'}</span></Button>} />
    {showForm && <form onSubmit={submit} className="ops-panel grid gap-4 p-5 md:grid-cols-2"><Input label="Article title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Account lockout recovery" /><Input label="Tags" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="Account access, Security" /><div className="md:col-span-2"><Input label="Agent summary" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="One sentence explaining when to use this guidance" /></div><div className="md:col-span-2"><Textarea label="Approved guidance" rows={5} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Steps, policy constraints, and customer-safe language..." /></div><Input label="Keywords" value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} placeholder="lockout, password, reset" /><div className="flex items-end"><Button type="submit" disabled={creating}>{creating && <Loader2 className="h-4 w-4 animate-spin" />}<span>Publish article</span></Button></div></form>}
    <div className="ops-panel p-3"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') loadArticles(); }} placeholder="Search approved guidance..." className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" /></div></div>
    {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-cyan-700" /></div> : <div className="grid gap-3 md:grid-cols-2">{articles.map((article) => <article key={article.slug} className="ops-panel p-5"><div className="flex items-start gap-2"><BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" /><div><h2 className="text-sm font-semibold text-slate-900">{article.title}</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">{article.summary}</p></div></div><div className="mt-4 flex flex-wrap gap-1.5">{article.tags.map((tag) => <span key={tag} className="rounded border border-cyan-100 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-800">{tag}</span>)}</div></article>)}</div>}
  </div>;
};

export default KnowledgeCenter;
