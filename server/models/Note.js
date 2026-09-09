import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: [true, 'ticket_id is required'],
      index: true,
      ref: 'Ticket',
    },
    note_text: {
      type: String,
      required: [true, 'note_text is required'],
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: 1,
    },
  },
  {
    versionKey: false,
  }
);

export const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
