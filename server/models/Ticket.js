import mongoose from 'mongoose';

// Counter schema for concurrency-safe sequential ticket IDs (TKT-001, TKT-002, etc.)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

export const getNextTicketId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'ticket_id' },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `TKT-${String(counter.seq).padStart(3, '0')}`;
};

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer_name: {
      type: String,
      required: [true, 'customer_name is required'],
      trim: true,
    },
    customer_email: {
      type: String,
      required: [true, 'customer_email is required'],
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Closed'],
      default: 'Open',
      index: true,
    },
    incident_id: {
      type: String,
      default: null,
      index: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: -1,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
