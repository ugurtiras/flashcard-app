import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './migrations/init';
import authRoutes from './routes/auth';
import wordlistRoutes from './routes/wordlists';
import cardRoutes from './routes/cards';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/wordlists', wordlistRoutes);
app.use('/api/cards', cardRoutes);

const PORT = process.env.PORT || 5000;

// Initialize database and start server
async function startServer() {
  try {
    await createTables();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
