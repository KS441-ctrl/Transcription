const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Store active sessions and participants
const sessions = new Map();

// Session management
class TranscriptionSession {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.participants = new Map();
    this.createdAt = Date.now();
  }

  addParticipant(socketId, userData) {
    this.participants.set(socketId, {
      ...userData,
      socketId,
      joinedAt: Date.now()
    });
  }

  removeParticipant(socketId) {
    this.participants.delete(socketId);
  }

  getParticipants() {
    return Array.from(this.participants.values());
  }

  isEmpty() {
    return this.participants.size === 0;
  }
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Create session
  socket.on('create-session', (data) => {
    const { sessionId, userName } = data;

    if (!sessionId || !userName) {
      socket.emit('error', 'Invalid session data');
      return;
    }

    // Create or get session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, new TranscriptionSession(sessionId));
    }

    const session = sessions.get(sessionId);

    // Check session size (max 4 participants)
    if (session.participants.size >= 4) {
      socket.emit('error', 'Session is full (max 4 participants)');
      return;
    }

    // Add participant
    session.addParticipant(socket.id, { userName });
    socket.join(sessionId);
    socket.sessionId = sessionId;

    console.log(`👤 ${userName} created/joined session: ${sessionId}`);

    // Notify all participants
    io.to(sessionId).emit('participant-joined', {
      sessionId,
      participant: { socketId: socket.id, userName },
      totalParticipants: session.participants.size,
      allParticipants: session.getParticipants()
    });

    socket.emit('session-created', {
      sessionId,
      participants: session.getParticipants()
    });
  });

  // Join session
  socket.on('join-session', (data) => {
    const { sessionId, userName } = data;

    if (!sessionId || !userName) {
      socket.emit('error', 'Invalid session data');
      return;
    }

    if (!sessions.has(sessionId)) {
      socket.emit('error', 'Session not found');
      return;
    }

    const session = sessions.get(sessionId);

    if (session.participants.size >= 4) {
      socket.emit('error', 'Session is full');
      return;
    }

    // Add participant
    session.addParticipant(socket.id, { userName });
    socket.join(sessionId);
    socket.sessionId = sessionId;

    console.log(`👥 ${userName} joined session: ${sessionId}`);

    // Notify all participants
    io.to(sessionId).emit('participant-joined', {
      sessionId,
      participant: { socketId: socket.id, userName },
      totalParticipants: session.participants.size,
      allParticipants: session.getParticipants()
    });

    socket.emit('session-joined', {
      sessionId,
      participants: session.getParticipants()
    });
  });

  // WebRTC Offer
  socket.on('webrtc-offer', (data) => {
    const { to, offer, from, fromName } = data;
    io.to(to).emit('webrtc-offer', {
      from,
      fromName,
      offer
    });
  });

  // WebRTC Answer
  socket.on('webrtc-answer', (data) => {
    const { to, answer, from, fromName } = data;
    io.to(to).emit('webrtc-answer', {
      from,
      fromName,
      answer
    });
  });

  // ICE Candidate
  socket.on('ice-candidate', (data) => {
    const { to, candidate, from } = data;
    io.to(to).emit('ice-candidate', {
      from,
      candidate
    });
  });

  // Broadcast transcription
  socket.on('transcript', (data) => {
    if (socket.sessionId) {
      io.to(socket.sessionId).emit('transcript', {
        from: socket.id,
        ...data
      });
    }
  });

  // Get participants in session
  socket.on('get-participants', (data) => {
    const { sessionId } = data;
    if (sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      socket.emit('participants-list', {
        participants: session.getParticipants()
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const sessionId = socket.sessionId;

    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId);
      const participant = session.participants.get(socket.id);
      const userName = participant?.userName || 'Unknown';

      session.removeParticipant(socket.id);

      console.log(`❌ ${userName} disconnected from session: ${sessionId}`);

      // Notify others
      io.to(sessionId).emit('participant-left', {
        socketId: socket.id,
        userName,
        totalParticipants: session.participants.size
      });

      // Clean up empty sessions
      if (session.isEmpty()) {
        sessions.delete(sessionId);
        console.log(`🗑️ Session deleted: ${sessionId}`);
      }
    }

    console.log(`User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// REST API endpoints
app.get('/api/sessions', (req, res) => {
  const sessionsList = Array.from(sessions.values()).map(session => ({
    sessionId: session.sessionId,
    participants: session.participants.size,
    createdAt: new Date(session.createdAt).toISOString()
  }));
  res.json(sessionsList);
});

app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    res.json({
      sessionId,
      participants: session.getParticipants(),
      participantCount: session.participants.size
    });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeSessions: sessions.size,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  🚀 Transcription Signaling Server started
  
  📍 URL: http://localhost:${PORT}
  🔌 WebSocket: ws://localhost:${PORT}
  
  📊 API Endpoints:
     GET /health - Server status
     GET /api/sessions - List all sessions
     GET /api/session/:sessionId - Get session details
  
  📱 Clients can connect at: http://localhost:${PORT}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
