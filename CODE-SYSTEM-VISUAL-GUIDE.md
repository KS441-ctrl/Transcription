# 6-Digit Code System - Visual Guide

## 🔄 Connection Flow

```
PERSON A (HOST)                          PERSON B (GUEST)
─────────────────────────────────────────────────────────

Opens call-with-code.html
        ↓
    "Generate Code (Host)"
        ↓
    Get: 123456
        ↓
    Shares code ──────────────────→ Receives: 123456
                                           ↓
                                    Opens app
                                           ↓
                                    Enters: 123456
                                           ↓
                                    Clicks "Join"
                                           ↓
        ← ← ← Code sent to server → → →
        
Server validates code ✓
Server creates session
Server connects both peers
        ↓ ↓ ↓
        
WebRTC P2P Connection Established
        ↓
Audio Stream ↔ Audio Stream
        ↓
Live Transcription starts
```

---

## 📱 3 Different Scenarios

### Scenario 1: Mobile ↔ Mobile

```
Friend 1 (Phone A)                Friend 2 (Phone B)
────────────────────────────────────────────────────

1. Open app in Safari              1. Waiting...
2. "Generate Code"                
3. Get: 654321
4. Text/WhatsApp: "654321"    ──→  Receives: 654321
                                  2. Open app
                                  3. Enter: 654321
                                  4. Click "Join"
                                  
                         ↓ ↓ ↓
                    Connected! ✓
                    Call started
                    Transcription live
```

### Scenario 2: Laptop ↔ Mobile

```
Laptop                             Phone
──────────────────────────────────────

1. Open browser on laptop         1. Same WiFi/Internet
2. localhost:3000
3. "Generate Code" → 789456
4. Show code on screen ──→        Sees: 789456
                                  
                                  2. Open app on phone
                                  3. Enter: 789456
                                  4. Click "Join"
                                  
                         ↓ ↓ ↓
                    Connected! ✓
                    Call + Transcription
```

### Scenario 3: Laptop ↔ Laptop

```
Laptop 1                           Laptop 2
────────────────────────────────────────────

1. Open app                       1. Open app
2. "Generate Code" → 111222
3. Copy & email/slack ──→         Receives: 111222
                                  2. Enter: 111222
                                  3. Click "Join"
                                  
                         ↓ ↓ ↓
                    Connected! ✓
                    Call + Real-time Transcription
```

---

## 🏗️ Backend Architecture

```
┌─────────────────────────────────────────┐
│         Browser (call-with-code.html)   │
│  ┌──────────────────────────────────┐   │
│  │  6-Digit Code Input/Display      │   │
│  │  Generate button (Host)          │   │
│  │  Join button (Guest)             │   │
│  │  Call controls (Mic, Speaker)    │   │
│  │  Live Transcription              │   │
│  │  API Usage Dashboard             │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↕ Socket.IO
┌─────────────────────────────────────────┐
│   Server (code-call-server.js)          │
│  ┌──────────────────────────────────┐   │
│  │  Code Generator                  │   │
│  │  activeCodes Map                 │   │
│  │  {123456 → session_abc123}       │   │
│  │                                  │   │
│  │  Session Manager                 │   │
│  │  peerSessions Map                │   │
│  │  {session_abc123 → peers}        │   │
│  │                                  │   │
│  │  WebRTC Signaling                │   │
│  │  (Offer/Answer/ICE)              │   │
│  │                                  │   │
│  │  Transcription Proxy             │   │
│  │  Routes audio → Deepgram         │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
              ↕ HTTPS
┌─────────────────────────────────────────┐
│   Deepgram API (Speech-to-Text)         │
│   api.deepgram.com/v1/listen            │
└─────────────────────────────────────────┘
```

---

## 🔐 Code Lifecycle

```
⏱️ Time 0:00
    ↓
Host clicks "Generate Code"
    ↓
Backend generates: 123456
    ↓
Code stored with expiry: 5 minutes
    ↓
Frontend displays: 123456 ✓
    ↓
⏱️ Time 0:15
    ↓
Host shares code with Friend
    ↓
⏱️ Time 1:30
    ↓
Guest enters: 123456
    ↓
Server validates code ✓
    ↓
Server creates session
    ↓
Peers connected via WebRTC
    ↓
⏱️ Time 12:45
    ↓
Either peer clicks "End Call"
    ↓
Session cleaned up
    ↓
Code invalid (already used)
    ↓
⏱️ Time 5:00
    ↓
Code auto-expires (if not used)
    ↓
Automatically deleted from server
```

---

## 💻 On-Screen Flow

```
┌──────────────────────────────────┐
│   QUICK CALL - Start State       │
├──────────────────────────────────┤
│                                  │
│  [------] ← Code display area    │
│   (waiting for generation)       │
│                                  │
│  ┌──────────────────────────┐    │
│  │ 📱 Generate Code (Host)  │ ←  Click to start
│  └──────────────────────────┘    │
│                                  │
│  ─── OR ───                      │
│                                  │
│  Enter 6-digit code:             │
│  ┌──────────┐ ┌──────┐           │
│  │ [______] │ │ Join │           │
│  └──────────┘ └──────┘           │
│                                  │
└──────────────────────────────────┘

            ↓ ↓ ↓

HOST SIDE (After clicking "Generate Code"):

┌──────────────────────────────────┐
│  QUICK CALL - Code Generated     │
├──────────────────────────────────┤
│                                  │
│     Share this code with friend: │
│                                  │
│        ┌──────────────┐           │
│        │   123456     │ ← Your    │
│        └──────────────┘   unique  │
│                            code   │
│  ⏱️ Expires in 4:30               │
│                                  │
│  (Friend can now enter: 123456)  │
│                                  │
└──────────────────────────────────┘

            ↓ ↓ ↓

GUEST SIDE (After entering code):

┌──────────────────────────────────┐
│  QUICK CALL - Connected          │
├──────────────────────────────────┤
│                                  │
│    ✓ Connected (Guest)           │
│                                  │
│  ┌─────────────┐ ┌────────────┐  │
│  │ 🎤 Enable   │ │ 🔊 Enable  │  │
│  │    Mic      │ │   Speaker  │  │
│  └─────────────┘ └────────────┘  │
│           ┌───────────────┐       │
│           │  End Call     │       │
│           └───────────────┘       │
│                                  │
│  ✍️ Transcription (Live)         │
│  ┌──────────────────────────────┐│
│  │ You: Hey, can you hear me?   ││
│  │ Friend: Yeah, perfect!       ││
│  │ You: Great, transcription is ││
│  │       working!               ││
│  └──────────────────────────────┘│
│                                  │
│  🤖 API: Deepgram               │
│  ✓ Active | 450/600 min left    │
│                                  │
└──────────────────────────────────┘
```

---

## 🔄 Data Flow During Call

```
Audio Capture (Mic)
        ↓
Browser Audio Context
        ↓
Convert to PCM16 Buffer
        ↓
Send via WebRTC Data Channel (P2P)
        ↓
Other person receives audio
        ↓
Send copy to server
        ↓
Server routes to Deepgram
        ↓
Deepgram processes speech
        ↓
Returns text: "Hey, can you hear me?"
        ↓
Send back via Socket.IO
        ↓
Display in transcript: "Friend: Hey, can you hear me?"
        ↓
Show which API used: Deepgram
        ↓
Update API usage: 450/600 remaining
```

---

## 📊 Code Storage (Backend)

```
activeCodes Map:
{
  "123456" → {
    hostId: "socket_xyz",
    sessionId: "session_abc123",
    createdAt: 1693735200000,
    expiresAt: 1693735500000  (5 min from now)
  },
  "654321" → {
    hostId: "socket_def",
    sessionId: "session_def456",
    createdAt: 1693735205000,
    expiresAt: 1693735505000
  }
}

peerSessions Map:
{
  "session_abc123" → {
    code: "123456",
    host: {
      id: "socket_xyz",
      socket: <Socket object>
    },
    guest: {
      id: "socket_uvw",
      socket: <Socket object>
    },
    transcripts: [
      { speaker: "host", text: "Hello", timestamp: ... },
      { speaker: "guest", text: "Hi there!", timestamp: ... }
    ],
    status: "connected",
    createdAt: 1693735200000
  }
}
```

---

## 🎯 Key Differences from Traditional WebRTC

| Traditional | 6-Digit Code |
|-------------|--------------|
| `{"type":"offer", "sdp":"..."}` | `123456` |
| Copy 500 chars | Copy 6 digits |
| Paste JSON | Paste code |
| Manual signaling | Automatic signaling |
| Error-prone | Simple & reliable |
| Not mobile-friendly | Mobile-friendly |

---

## 🚀 Performance

- **Code generation:** <1ms
- **Code validation:** <1ms
- **WebRTC setup:** ~1-2 seconds
- **First transcription:** ~500ms (Deepgram)
- **Subsequent transcriptions:** ~250ms average
- **Fallback to Speechmatics:** Auto (if Deepgram quota exceeded)
- **Fallback to Whisper:** Auto (if both exhausted)

---

## ✅ Status Indicators

```
Connecting → 🟡 Yellow (spinning)
Connected  → 🟢 Green (checkmark)
Error      → 🔴 Red (X mark)
Waiting    → ⚪ Gray (dots)
Completed  → ✓ Green checkmark
```

---

## 📱 Mobile vs Desktop

### Desktop Experience
```
Browser → Type code → Click Join → Connected
```

### Mobile Experience
```
Browser → Voice to friend (code) → Type code → Click Join → Connected
Much easier! No long JSON copy-paste
```

---

**Summary:** 6-digit codes are simple, shareable, and work perfectly for connecting people on any device! 🎉
