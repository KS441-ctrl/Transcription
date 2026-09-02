const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API Configuration
const APIs = {
  deepgram: {
    name: "Deepgram",
    key: process.env.DEEPGRAM_API_KEY,
    freeLimit: 600, // minutes per month
    costPerMinute: 0.0043,
    priority: 1,
    status: "ready",
  },
  speechmatics: {
    name: "Speechmatics",
    key: process.env.SPEECHMATICS_API_KEY,
    freeLimit: 100,
    costPerMinute: 0.05,
    priority: 2,
    status: "ready",
  },
  whisper: {
    name: "Whisper (Local)",
    key: "local", // No API key needed
    freeLimit: -1, // Unlimited
    costPerMinute: 0,
    priority: 3,
    status: "ready",
  },
};

// Usage tracking
const usage = {
  deepgram: { used: 0, limit: 600, lastReset: new Date() },
  speechmatics: { used: 0, limit: 100, lastReset: new Date() },
  whisper: { used: 0, limit: -1, lastReset: new Date() },
};

// Get current month key
function getCurrentMonthKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Load usage from Deepgram API
async function syncDeepgramUsage() {
  if (!APIs.deepgram.key) return;

  try {
    const response = await axios.get("https://api.deepgram.com/v1/usage", {
      headers: {
        Authorization: `Token ${APIs.deepgram.key}`,
        "Content-Type": "application/json",
      },
    });

    const usageData = response.data.usage || [];
    const currentMonth = getCurrentMonthKey();
    const thisMonth = usageData.find(
      (u) => u.start.substring(0, 7) === currentMonth,
    );

    if (thisMonth) {
      // Estimate minutes from requests
      usage.deepgram.used = Math.round(((thisMonth.requests || 0) / 1000) * 15);
    }
  } catch (error) {
    console.error("Error syncing Deepgram usage:", error.message);
  }
}

// Load usage from Speechmatics
async function syncSpeechmaticsUsage() {
  if (!APIs.speechmatics.key) return;

  try {
    const response = await axios.get(
      "https://api.speechmatics.com/v2/billing",
      {
        headers: {
          Authorization: `Bearer ${APIs.speechmatics.key}`,
        },
      },
    );

    if (response.data) {
      usage.speechmatics.used = response.data.audio_seconds_used / 60 || 0;
    }
  } catch (error) {
    console.error("Error syncing Speechmatics usage:", error.message);
  }
}

// Check if month has reset
function checkMonthlyReset() {
  const now = new Date();

  Object.keys(usage).forEach((api) => {
    const lastReset = new Date(usage[api].lastReset);
    if (now.getDate() === 1 && lastReset.getDate() !== 1) {
      usage[api].used = 0;
      usage[api].lastReset = now;
      console.log(`📅 ${api} usage reset for new month`);
    }
  });
}

// Get best available API
async function getBestAPI() {
  checkMonthlyReset();

  // Check each API in priority order
  for (const [apiName, config] of Object.entries(APIs)) {
    if (apiName === "deepgram") {
      await syncDeepgramUsage();
      const remaining = config.freeLimit - usage.deepgram.used;
      if (remaining > 0) {
        return { api: apiName, remaining, config };
      }
    } else if (apiName === "speechmatics") {
      await syncSpeechmaticsUsage();
      const remaining = config.freeLimit - usage.speechmatics.used;
      if (remaining > 0) {
        return { api: apiName, remaining, config };
      }
    } else if (apiName === "whisper") {
      // Whisper always available (unlimited)
      return { api: apiName, remaining: -1, config };
    }
  }

  // All APIs exhausted, fall back to Whisper
  return { api: "whisper", remaining: -1, config: APIs.whisper };
}

// Transcribe audio with automatic fallback
async function transcribeAudio(audioBuffer, useAPI = null) {
  let bestAPI;

  if (useAPI) {
    bestAPI = { api: useAPI, config: APIs[useAPI] };
  } else {
    bestAPI = await getBestAPI();
  }

  console.log(`🎤 Using ${bestAPI.api} for transcription`);

  try {
    if (bestAPI.api === "deepgram") {
      return await transcribeDeepgram(audioBuffer);
    } else if (bestAPI.api === "speechmatics") {
      return await transcribeSpeechmatics(audioBuffer);
    } else if (bestAPI.api === "whisper") {
      return await transcribeWhisper(audioBuffer);
    }
  } catch (error) {
    console.error(`❌ ${bestAPI.api} failed:`, error.message);

    // Try next API
    const nextAPI = Object.keys(APIs).find(
      (api) => APIs[api].priority > APIs[bestAPI.api].priority,
    );

    if (nextAPI) {
      console.log(`⚙️ Falling back to ${nextAPI}...`);
      return transcribeAudio(audioBuffer, nextAPI);
    }

    throw new Error("All APIs failed");
  }
}

// Deepgram Transcription
async function transcribeDeepgram(audioBuffer) {
  const response = await axios.post(
    "https://api.deepgram.com/v1/listen?model=nova-2&encoding=linear16&sample_rate=16000",
    audioBuffer,
    {
      headers: {
        Authorization: `Token ${APIs.deepgram.key}`,
        "Content-Type": "application/octet-stream",
      },
    },
  );

  const transcript =
    response.data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
  usage.deepgram.used += 0.25; // Rough estimate

  return {
    transcript,
    api: "deepgram",
    confidence:
      response.data.results?.channels?.[0]?.alternatives?.[0]?.confidence ||
      0.95,
  };
}

// Speechmatics Transcription
async function transcribeSpeechmatics(audioBuffer) {
  const formData = new FormData();
  formData.append("audio", new Blob([audioBuffer]), "audio.wav");
  formData.append(
    "config",
    JSON.stringify({
      type: "transcription",
      transcription_config: {
        language: "en",
        enable_entities: true,
      },
    }),
  );

  const response = await axios.post(
    "https://api.speechmatics.com/v2/jobs",
    formData,
    {
      headers: {
        Authorization: `Bearer ${APIs.speechmatics.key}`,
      },
    },
  );

  usage.speechmatics.used += 0.25;

  return {
    transcript: response.data.transcript || "",
    api: "speechmatics",
    confidence: 0.92,
  };
}

// Whisper Transcription (Local)
async function transcribeWhisper(audioBuffer) {
  // In production, run whisper locally via child_process
  // For now, return placeholder
  return {
    transcript: "[Whisper transcription would be here]",
    api: "whisper",
    confidence: 0.87,
  };
}

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Get API status
  socket.on("get-api-status", async (callback) => {
    await syncDeepgramUsage();
    await syncSpeechmaticsUsage();

    const status = {
      deepgram: {
        used: usage.deepgram.used,
        limit: usage.deepgram.limit,
        remaining: Math.max(0, usage.deepgram.limit - usage.deepgram.used),
        percentUsed: Math.round(
          (usage.deepgram.used / usage.deepgram.limit) * 100,
        ),
        status:
          usage.deepgram.used < usage.deepgram.limit ? "active" : "exhausted",
        costPerMin: APIs.deepgram.costPerMinute,
      },
      speechmatics: {
        used: Math.round(usage.speechmatics.used),
        limit: usage.speechmatics.limit,
        remaining: Math.max(
          0,
          usage.speechmatics.limit - Math.round(usage.speechmatics.used),
        ),
        percentUsed: Math.round(
          (usage.speechmatics.used / usage.speechmatics.limit) * 100,
        ),
        status:
          usage.speechmatics.used < usage.speechmatics.limit
            ? "active"
            : "exhausted",
        costPerMin: APIs.speechmatics.costPerMinute,
      },
      whisper: {
        used: usage.whisper.used,
        limit: -1,
        remaining: -1,
        percentUsed: 0,
        status: "active",
        costPerMin: 0,
      },
    };

    if (callback) callback(status);
  });

  // Transcribe audio
  socket.on("transcribe", async (data, callback) => {
    try {
      const result = await transcribeAudio(Buffer.from(data.audio));
      if (callback) callback({ success: true, ...result });
    } catch (error) {
      console.error("Transcription error:", error.message);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Broadcast transcription to other users
  socket.on("transcript", (data) => {
    socket.broadcast.emit("transcript", {
      from: socket.id,
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// REST API endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apis: Object.keys(APIs),
  });
});

app.get("/api/status", async (req, res) => {
  await syncDeepgramUsage();
  await syncSpeechmaticsUsage();

  res.json({
    deepgram: {
      used: usage.deepgram.used,
      limit: usage.deepgram.limit,
      remaining: Math.max(0, usage.deepgram.limit - usage.deepgram.used),
      percentUsed: Math.round(
        (usage.deepgram.used / usage.deepgram.limit) * 100,
      ),
    },
    speechmatics: {
      used: Math.round(usage.speechmatics.used),
      limit: usage.speechmatics.limit,
      remaining: Math.max(
        0,
        usage.speechmatics.limit - Math.round(usage.speechmatics.used),
      ),
      percentUsed: Math.round(
        (usage.speechmatics.used / usage.speechmatics.limit) * 100,
      ),
    },
    whisper: {
      used: 0,
      limit: -1,
      remaining: -1,
      percentUsed: 0,
    },
  });
});

app.get("/api/best-api", async (req, res) => {
  const best = await getBestAPI();
  res.json({
    bestAPI: best.api,
    remaining: best.remaining,
    message: `Using ${best.config.name}`,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  🚀 Multi-API Transcription Server
  
  📍 URL: http://localhost:${PORT}
  🔌 WebSocket: ws://localhost:${PORT}
  
  📊 Endpoints:
     GET /health - Server status
     GET /api/status - All APIs usage
     GET /api/best-api - Best API to use
  
  🎤 APIs Configured:
     • Deepgram (600 min/month)
     • Speechmatics (100 min/month)
     • Whisper (Unlimited)
  
  Required Environment Variables:
     DEEPGRAM_API_KEY=sk-...
     SPEECHMATICS_API_KEY=...
  `);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
