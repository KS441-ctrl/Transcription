const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// ============ CODE MANAGEMENT ============
const activeCodes = new Map(); // code -> { hostId, sessionId, createdAt, expiresAt }
const peerSessions = new Map(); // sessionId -> { host, guest, transcripts }

function generateCode() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

function createSession(code, hostId) {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute expiry
  
  activeCodes.set(code, {
    hostId,
    sessionId,
    createdAt: Date.now(),
    expiresAt
  });
  
  peerSessions.set(sessionId, {
    code,
    host: { id: hostId, socket: null },
    guest: { id: null, socket: null },
    transcripts: [],
    createdAt: Date.now(),
    status: 'waiting-guest'
  });
  
  return { code, sessionId, expiresAt };
}

function validateCode(code) {
  const session = activeCodes.get(code);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeCodes.delete(code);
    return null;
  }
  return session;
}

// ============ CLEANUP EXPIRED CODES ============
setInterval(() => {
  const now = Date.now();
  for (const [code, session] of activeCodes.entries()) {
    if (now > session.expiresAt) {
      activeCodes.delete(code);
      peerSessions.delete(session.sessionId);
    }
  }
}, 30000); // Check every 30 seconds

// ============ SOCKET.IO HANDLERS ============
io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);
  
  // ---- HOST: Generate code ----
  socket.on('host-generate-code', (data, callback) => {
    const { code, sessionId, expiresAt } = createSession(data.code, socket.id);
    
    socket.join(sessionId);
    
    const session = peerSessions.get(sessionId);
    session.host.socket = socket;
    session.status = 'waiting-guest';
    
    console.log(`🔑 Code generated: ${code} (Session: ${sessionId})`);
    
    callback({
      success: true,
      code,
      sessionId,
      expiresAt
    });
  });
  
  // ---- GUEST: Join using code ----
  socket.on('guest-join-code', (data, callback) => {
    const code = data.code;
    const session = validateCode(code);
    
    if (!session) {
      console.log(`❌ Invalid/expired code: ${code}`);
      callback({
        success: false,
        error: 'Invalid or expired code'
      });
      return;
    }
    
    const sessionId = session.sessionId;
    const peerSession = peerSessions.get(sessionId);
    
    if (peerSession.guest.id) {
      callback({
        success: false,
        error: 'Session already has guest'
      });
      return;
    }
    
    socket.join(sessionId);
    peerSession.guest.socket = socket;
    peerSession.guest.id = socket.id;
    peerSession.status = 'connected';
    
    console.log(`✓ Guest joined: ${socket.id} (Code: ${code})`);
    
    // Notify host that guest joined
    io.to(sessionId).emit('guest-joined', {
      guestId: socket.id,
      sessionId
    });
    
    callback({
      success: true,
      sessionId,
      peerId: peerSession.host.id
    });
  });
  
  // ---- WEBRTC SIGNALING ----
  socket.on('webrtc-offer', (data) => {
    const { sessionId, offer } = data;
    const session = peerSessions.get(sessionId);
    
    if (!session) return;
    
    // Send offer to other peer
    const targetId = socket.id === session.host.id ? session.guest.id : session.host.id;
    io.to(sessionId).emit('webrtc-offer-received', {
      fromId: socket.id,
      offer
    });
    
    console.log(`📤 Offer sent in session ${sessionId}`);
  });
  
  socket.on('webrtc-answer', (data) => {
    const { sessionId, answer } = data;
    io.to(sessionId).emit('webrtc-answer-received', {
      fromId: socket.id,
      answer
    });
    console.log(`📥 Answer sent in session ${sessionId}`);
  });
  
  socket.on('webrtc-ice-candidate', (data) => {
    const { sessionId, candidate } = data;
    io.to(sessionId).emit('webrtc-ice-candidate', {
      fromId: socket.id,
      candidate
    });
  });
  
  // ---- TRANSCRIPTION ----
  socket.on('add-transcript', (data) => {
    const { sessionId, speaker, text } = data;
    const session = peerSessions.get(sessionId);
    
    if (!session) return;
    
    session.transcripts.push({
      speaker: socket.id === session.host.id ? 'host' : 'guest',
      text,
      timestamp: Date.now()
    });
    
    // Broadcast to both peers
    io.to(sessionId).emit('transcript-updated', {
      speaker: socket.id === session.host.id ? 'You' : 'Friend',
      text
    });
  });
  
  // ---- END CALL ----
  socket.on('end-call', (data) => {
    const { sessionId } = data;
    const session = peerSessions.get(sessionId);
    
    if (session) {
      console.log(`🛑 Call ended: ${sessionId}`);
      io.to(sessionId).emit('call-ended');
      
      // Clean up after delay
      setTimeout(() => {
        peerSessions.delete(sessionId);
        activeCodes.forEach((value, key) => {
          if (value.sessionId === sessionId) {
            activeCodes.delete(key);
          }
        });
      }, 1000);
    }
    
    socket.leave(sessionId);
  });
  
  // ---- DISCONNECT ----
  socket.on('disconnect', () => {
    console.log(`📵 Client disconnected: ${socket.id}`);
    
    // Clean up sessions
    for (const [sessionId, session] of peerSessions.entries()) {
      if (session.host.id === socket.id || session.guest.id === socket.id) {
        io.to(sessionId).emit('peer-disconnected');
        peerSessions.delete(sessionId);
        
        activeCodes.forEach((value, key) => {
          if (value.sessionId === sessionId) {
            activeCodes.delete(key);
          }
        });
      }
    }
  });
});

// ============ REST API ENDPOINTS ============

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Get active sessions count
app.get('/api/stats', (req, res) => {
  res.json({
    activeCodes: activeCodes.size,
    activeSessions: peerSessions.size,
    totalSessions: peerSessions.size
  });
});

// Validate code (for verification)
app.post('/api/validate-code', (req, res) => {
  const { code } = req.body;
  const session = validateCode(code);
  
  if (session) {
    res.json({
      valid: true,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt
    });
  } else {
    res.json({ valid: false });
  }
});

// ============ DEEPGRAM TRANSCRIPTION PROXY ============
const axios = require('axios');

async function transcribeWithDeepgram(audioBuffer) {
  try {
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen?model=nova&punctuate=true',
      audioBuffer,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        }
      }
    );
    
    return response.data.results?.channels[0]?.alternatives[0]?.transcript || '';
  } catch (error) {
    console.error('Deepgram error:', error.message);
    return null;
  }
}

// Transcription endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const audioBuffer = req.body;
    const text = await transcribeWithDeepgram(audioBuffer);
    
    if (text) {
      res.json({ success: true, text });
    } else {
      res.json({ success: false, error: 'Transcription failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ START SERVER ============
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Quick Call Server (6-Digit Code)  ║
║════════════════════════════════════════║
║  📍 URL: http://localhost:${PORT}      ║
║  🌐 Open: call-with-code.html          ║
║  📊 Stats: http://localhost:${PORT}/api/stats   ║
║  ✓ Ready for connections               ║
╚════════════════════════════════════════╝
  `);
});

module.exports = server;
