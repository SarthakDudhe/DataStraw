import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Loader2, 
  Plus, 
  Search, 
  X, 
  Edit3, 
  ThumbsUp, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Filter, 
  Clock 
} from 'lucide-react';
import { 
  getKnowledgeArticles, 
  createKnowledgeArticle, 
  updateKnowledgeArticle, 
  incrementArticleHelpful 
} from '../services/ticketApi';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Select from '../components/common/Select';
import { useToast } from '../components/common/Toast';
import { formatDate } from '../utils/formatDate';

const statusBadgeStyles = {
  Published: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  Draft: 'bg-amber-50 border-amber-200 text-amber-700',
};

const KnowledgeCenter = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create Modal State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    summary: '',
    content: '',
    tags: '',
    keywords: '',
    status: 'Published',
  });

  // Edit / Detail Modal State
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [votingHelpful, setVotingHelpful] = useState(false);

  const { showToast } = useToast();

  const loadArticles = async (term = search, status = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const data = await getKnowledgeArticles({ search: term, status });
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load knowledge articles');
      showToast(err.message || 'Unable to load knowledge articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles(search, statusFilter);
  }, [statusFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const slug = createForm.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug || !createForm.summary.trim() || !createForm.content.trim()) {
      return showToast('Complete the title, summary, and approved guidance fields.', 'error');
    }

    setCreating(true);
    try {
      await createKnowledgeArticle({
        slug,
        title: createForm.title.trim(),
        summary: createForm.summary.trim(),
        content: createForm.content.trim(),
        tags: createForm.tags.split(',').map((v) => v.trim()).filter(Boolean),
        keywords: createForm.keywords.split(',').map((v) => v.trim()).filter(Boolean),
        status: createForm.status,
      });

      setCreateForm({ title: '', summary: '', content: '', tags: '', keywords: '', status: 'Published' });
      setShowCreateForm(false);
      showToast('Knowledge article published successfully.', 'success');
      await loadArticles();
    } catch (err) {
      showToast(err.message || 'Failed to create article', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleEditOpen = (article) => {
    setEditingArticle({
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      content: article.content,
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      keywords: Array.isArray(article.keywords) ? article.keywords.join(', ') : '',
      status: article.status || 'Published',
      helpful_count: article.helpful_count || 0,
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editingArticle) return;

    setUpdating(true);
    try {
      await updateKnowledgeArticle(editingArticle.slug, {
        title: editingArticle.title.trim(),
        summary: editingArticle.summary.trim(),
        content: editingArticle.content.trim(),
        tags: editingArticle.tags.split(',').map((v) => v.trim()).filter(Boolean),
        keywords: editingArticle.keywords.split(',').map((v) => v.trim()).filter(Boolean),
        status: editingArticle.status,
      });

      showToast('Article updated successfully.', 'success');
      setEditingArticle(null);
      if (selectedArticle?.slug === editingArticle.slug) {
        setSelectedArticle(null);
      }
      await loadArticles();
    } catch (err) {
      showToast(err.message || 'Failed to update article', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleHelpfulVote = async (slug) => {
    setVotingHelpful(true);
    try {
      const res = await incrementArticleHelpful(slug);
      showToast('Helpful vote recorded. This article will be ranked higher for future cases.', 'success');
      
      // Update local state
      setArticles((prev) =>
        prev.map((art) => (art.slug === slug ? { ...art, helpful_count: res.helpful_count } : art))
      );
      if (selectedArticle?.slug === slug) {
        setSelectedArticle((prev) => ({ ...prev, helpful_count: res.helpful_count }));
      }
    } catch (err) {
      showToast(err.message || 'Unable to record vote', 'error');
    } finally {
      setVotingHelpful(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Center"
        description="Company-approved guidance used to ground agent decisions and Gemini AI replies."
        action={
          <Button onClick={() => setShowCreateForm((open) => !open)}>
            {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span>{showCreateForm ? 'Cancel' : 'New Article'}</span>
          </Button>
        }
      />

      {/* Create Article Drawer / Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateSubmit} className="ops-panel grid gap-4 p-5 md:grid-cols-2 animate-in fade-in duration-150">
          <div className="md:col-span-2 flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">Create Approved Knowledge Article</h3>
            <span className="text-xs text-slate-500">Only Published articles will be cited by AI</span>
          </div>

          <Input
            label="Article Title"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            placeholder="e.g. Account lockout and MFA recovery checklist"
            required
          />

          <Select
            label="Publishing Status"
            value={createForm.status}
            onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
            options={['Published', 'Draft']}
          />

          <div className="md:col-span-2">
            <Input
              label="Agent Summary"
              value={createForm.summary}
              onChange={(e) => setCreateForm({ ...createForm, summary: e.target.value })}
              placeholder="One concise sentence explaining when support agents should apply this guidance"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Approved Guidance (Customer-Safe Content)"
              rows={6}
              value={createForm.content}
              onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
              placeholder="Step-by-step resolution checklist, policy constraints, and customer-safe instructions..."
              required
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            value={createForm.tags}
            onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
            placeholder="Account access, Security, Password"
          />

          <Input
            label="Keywords (comma-separated)"
            value={createForm.keywords}
            onChange={(e) => setCreateForm({ ...createForm, keywords: e.target.value })}
            placeholder="lockout, token, reset, expired"
          />

          <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setShowCreateForm(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Publish Article</span>
            </Button>
          </div>
        </form>
      )}

      {/* Toolbar: Search and Status Filter Tabs */}
      <div className="ops-panel p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') loadArticles(search, statusFilter);
            }}
            placeholder="Search approved guidance by keyword, tag, or topic..."
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
          </span>
          {['All', 'Published', 'Draft'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                statusFilter === status
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 ops-panel">
          <Loader2 className="h-7 w-7 animate-spin text-cyan-700" />
          <p className="mt-2 text-xs text-slate-500">Loading approved knowledge guidance...</p>
        </div>
      ) : error ? (
        <div className="ops-panel p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">Failed to load articles</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <Button variant="secondary" onClick={() => loadArticles(search, statusFilter)}>
            Retry Loading
          </Button>
        </div>
      ) : articles.length === 0 ? (
        <div className="ops-panel flex flex-col items-center px-6 py-16 text-center">
          <BookOpen className="h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-sm font-semibold text-slate-800">No knowledge articles found</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {search
              ? `No articles match "${search}". Try searching for terms like "payment", "login", or "incident".`
              : 'Add your first company-approved guidance article to empower your agents and AI responses.'}
          </p>
          {search && (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setSearch('');
                loadArticles('', statusFilter);
              }}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        /* Article Catalog Grid */
        <div className="grid gap-3.5 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="ops-panel p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900 leading-snug">
                        {article.title}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-mono">{article.slug}</span>
                        <span>·</span>
                        <span>{formatDate(article.updated_at || article.created_at, false)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadgeStyles[article.status] || statusBadgeStyles.Draft}`}>
                    {article.status || 'Published'}
                  </span>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                  {article.summary}
                </p>

                {article.tags && article.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-cyan-100 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => handleHelpfulVote(article.slug)}
                  disabled={votingHelpful}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-cyan-700 transition-colors"
                  title="Mark this article helpful (increases ranking for relevant tickets)"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="font-semibold text-slate-700">{article.helpful_count || 0}</span>
                  <span className="text-[11px]">helpful</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(article)}
                    className="ops-icon-button"
                    title="View Full Guidance"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditOpen(article)}
                    className="ops-icon-button"
                    title="Edit Article"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* View Full Guidance Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusBadgeStyles[selectedArticle.status] || statusBadgeStyles.Draft}`}>
                    {selectedArticle.status}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{selectedArticle.slug}</span>
                </div>
                <h2 className="mt-1.5 text-base font-bold text-slate-900">{selectedArticle.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Summary
              </span>
              <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100">
                {selectedArticle.summary}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Approved Guidance Content
              </span>
              <div className="text-xs leading-relaxed text-slate-800 bg-white p-4 rounded-md border border-slate-200 whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
            </div>

            {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Keywords
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedArticle.keywords.map((kw) => (
                    <span key={kw} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleHelpfulVote(selectedArticle.slug)}
                disabled={votingHelpful}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-50 border border-cyan-100 text-xs font-medium text-cyan-800 hover:bg-cyan-100 transition-colors"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Mark Helpful ({selectedArticle.helpful_count || 0})</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    handleEditOpen(selectedArticle);
                    setSelectedArticle(null);
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  <span>Edit Article</span>
                </Button>
                <Button onClick={() => setSelectedArticle(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleEditSave}
            className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Edit Knowledge Article</h2>
                <span className="font-mono text-xs text-slate-400">{editingArticle.slug}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Article Title"
                value={editingArticle.title}
                onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                required
              />

              <Select
                label="Status"
                value={editingArticle.status}
                onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value })}
                options={['Published', 'Draft']}
              />

              <div className="md:col-span-2">
                <Input
                  label="Summary"
                  value={editingArticle.summary}
                  onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Approved Guidance"
                  rows={6}
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Tags (comma-separated)"
                value={editingArticle.tags}
                onChange={(e) => setEditingArticle({ ...editingArticle, tags: e.target.value })}
              />

              <Input
                label="Keywords (comma-separated)"
                value={editingArticle.keywords}
                onChange={(e) => setEditingArticle({ ...editingArticle, keywords: e.target.value })}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingArticle(null)} disabled={updating}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default KnowledgeCenter;
