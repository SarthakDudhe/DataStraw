import mongoose from 'mongoose';

const knowledgeArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    status: { type: String, enum: ['Published', 'Draft'], default: 'Published', index: true },
    helpful_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const KnowledgeArticle = mongoose.models.KnowledgeArticle || mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
