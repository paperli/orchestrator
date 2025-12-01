/**
 * Multiscreen Orchestrator Backend Server
 * Handles real-time communication between TV and Phone devices
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { SessionManager } from './session-manager.js';
import { setupWebSocket } from './websocket.js';
import { setupRoutes } from './routes.js';

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server
const server = createServer(app);

// Initialize session manager
const sessionManager = new SessionManager();

// Set up WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });
setupWebSocket(wss, sessionManager);

// Set up API routes
setupRoutes(app, sessionManager);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Orchestrator backend running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready at ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
