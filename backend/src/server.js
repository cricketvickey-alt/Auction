import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './utils/db.js';
import playersRouter from './routes/players.js';
import teamsRouter from './routes/teams.js';
import auctionRouter, { initAuctionSockets } from './routes/auction.js';
import adminRouter from './routes/admin.js';
import { adminAuth } from './middleware/adminAuth.js';

const app = express();
const server = http.createServer(app);

// Socket.IO with CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://112c94d4a91d.ngrok-free.app',
      /\.ngrok-free\.app$/,
      /\.ngrok\.io$/,
      /\.vercel\.app$/  // Allow all Vercel deployments
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
});

// Init shared socket reference
initAuctionSockets(io);

// Express CORS middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://112c94d4a91d.ngrok-free.app',
    /\.ngrok-free\.app$/,
    /\.ngrok\.io$/,
    /\.vercel\.app$/  // Allow all Vercel deployments
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/auction', auctionRouter);
app.use('/api/admin', adminAuth, adminRouter);

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  server.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});
