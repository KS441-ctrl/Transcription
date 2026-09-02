const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { promisify } = require('util');
require('dotenv').config();

const execFileAsync = promisify(execFile);

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

function createUniqueCode() {
  let code = generateCode();
  while (activeCodes.has(code)) {
    code = generateCode();
  }
  return code;
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
    const { code, sessionId, expiresAt } = createSession(createUniqueCode(), socket.id);
    
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
    
    // Send offer only to the other peer
    const targetId = socket.id === session.host.id ? session.guest.id : session.host.id;
    if (!targetId) return;
    io.to(targetId).emit('webrtc-offer-received', {
      fromId: socket.id,
      offer
    });
    
    console.log(`📤 Offer sent in session ${sessionId}`);
  });
  
  socket.on('webrtc-answer', (data) => {
    const { sessionId, answer } = data;
    const session = peerSessions.get(sessionId);
    if (!session) return;
    const targetId = socket.id === session.host.id ? session.guest.id : session.host.id;
    if (!targetId) return;
    io.to(targetId).emit('webrtc-answer-received', {
      fromId: socket.id,
      answer
    });
    console.log(`📥 Answer sent in session ${sessionId}`);
  });
  
  socket.on('webrtc-ice-candidate', (data) => {
    const { sessionId, candidate } = data;
    const session = peerSessions.get(sessionId);
    if (!session) return;
    const targetId = socket.id === session.host.id ? session.guest.id : session.host.id;
    if (!targetId) return;
    io.to(targetId).emit('webrtc-ice-candidate', {
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
      senderId: socket.id,
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

// ============ LOCAL WHISPER FALLBACK ============
app.post('/api/whisper', express.raw({ type: 'audio/*', limit: '25mb' }), async (req, res) => {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'transcription-'));
  const audioPath = path.join(tempDirectory, `${crypto.randomUUID()}.webm`);
  try {
    await fs.writeFile(audioPath, req.body);
    const outputDirectory = path.join(tempDirectory, 'output');
    await fs.mkdir(outputDirectory);
    await execFileAsync(process.env.PYTHON_COMMAND || 'python', [
      '-m', 'whisper', audioPath,
      '--model', process.env.WHISPER_MODEL || 'base',
      '--language', process.env.WHISPER_LANGUAGE || 'en',
      '--output_format', 'txt',
      '--output_dir', outputDirectory,
      '--fp16', 'False'
    ], { maxBuffer: 1024 * 1024 });
    const textPath = path.join(outputDirectory, `${path.basename(audioPath, '.webm')}.txt`);
    const text = (await fs.readFile(textPath, 'utf8')).trim();
    res.json({ success: true, text, engine: 'Local Whisper' });
  } catch (error) {
    console.error('Whisper error:', error.message);
    res.status(503).json({ success: false, error: 'Local Whisper is unavailable' });
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true });
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
