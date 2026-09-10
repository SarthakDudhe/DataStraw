import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incident_id: { type: String, required: true, unique: true, index: true },
    fingerprint: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Investigating', 'Monitoring', 'Resolved'],
      default: 'Investigating',
      index: true,
    },
    ticket_ids: { type: [String], default: [] },
    public_update: { type: String, default: '', trim: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Incident = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);
