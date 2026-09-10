import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { connectDB } from './configs/db.js';
import ticketRoutes from './routes/ticketRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import operationsRoutes from './routes/operationsRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mount Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.send('Support CRM API Server is running');
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect to MongoDB and start listening
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error.message);
    process.exit(1);
  }
};

startServer();
