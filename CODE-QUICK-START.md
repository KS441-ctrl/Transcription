# ⚡ 6-Digit Code - 2-Minute Quick Start

## What You'll Do

**Host:** Click button → Get code `123456` → Send to friend  
**Guest:** Enter `123456` → Click Join → Connected! ✅

---

## ⚙️ Setup (5 minutes)

```bash
# 1. Navigate to folder
cd d:\Transcription

# 2. Create .env file with API key
# Copy .env.example and add:
DEEPGRAM_API_KEY=sk-your-key-here

# 3. Install (one time only)
npm install

# 4. Start server
node code-call-server.js

# You should see:
# 🚀 Quick Call Server (6-Digit Code)
# 📍 URL: http://localhost:3000
```

---

## 🎯 Usage

**On Computer:**
```
1. Open browser
2. Go to: localhost:3000/call-with-code.html
```

**On Phone (Same WiFi):**
```
1. Open browser
2. Find your computer IP:
   Windows: ipconfig → IPv4 Address (e.g., 192.168.1.100)
3. Go to: http://192.168.1.100:3000/call-with-code.html
```

---

## 💬 How to Make a Call

### Person A (Host)
```
1. Open app
2. Click "📱 Generate Code (Host)"
3. Get code: 654321
4. Send to person B any way (text, email, voice)
5. Wait for connection
```

### Person B (Guest)
```
1. Receive code: 654321
2. Open app
3. Enter code in box
4. Click "Join"
5. Auto-connected! ✅
6. Microphone & audio activate
7. Live transcription starts
```

---

## 📱 3 Ways to Connect

| Setup | How |
|------|-----|
| **Mobile ↔ Mobile** | Both on same WiFi, share code via text |
| **Laptop ↔ Mobile** | Share code by showing screen or text |
| **Laptop ↔ Laptop** | Email/Slack/message the code |

---

## 🎤 On the Call

```
Button                 What It Does
────────────────────────────────────
🎤 Enable Mic          Turn your microphone on/off
🔊 Enable Speaker      Turn other person's audio on/off
End Call               Stop call, disconnect both
```

---

## ✨ Features You Get

- ✅ **6-digit codes** (simple, shareable)
- ✅ **Auto-connection** (no manual signaling)
- ✅ **Live transcription** (speech → text)
- ✅ **Both ways hear live** (your words appear instantly)
- ✅ **API tracking** (see remaining free minutes)
- ✅ **Mobile friendly** (works on phones)
- ✅ **Laptop friendly** (works on computers)

---

## ❌ Troubleshooting

| Problem | Fix |
|---------|-----|
| "Invalid code" | Code expired (5 min limit) - Generate new one |
| No transcription | Check Deepgram API key in .env |
| Server won't start | Port 3000 busy? Use: `set PORT=3001` |
| No microphone | Browser permission needed (Allow when asked) |
| Can't reach phone | Make sure on same WiFi network |

---

## 📊 What Happens Behind the Scenes

```
You generate code 123456
    ↓
Server stores: 123456 → (your session)
    ↓
You send to friend
    ↓
Friend enters: 123456
    ↓
Server validates code ✓
    ↓
Server connects both peers via WebRTC
    ↓
Your audio ↔ Friend's audio (P2P)
    ↓
Both get transcribed by Deepgram
    ↓
Live text appears on both screens
    ↓
Either person ends call
    ↓
Session cleaned up
```

---

## 💰 Pricing (All Free)

- **Deepgram**: 600 min/month FREE
- **Speechmatics**: 100 min/month FREE (auto fallback)
- **Whisper**: UNLIMITED (local, auto fallback)
- **Total**: 700+ min/month completely FREE

---

## 🔒 Security Notes

- Code expires in 5 minutes (new code each call)
- Code can only be used once
- WebRTC audio is peer-to-peer (encrypted)
- Transcription uses your Deepgram API key
- Server doesn't see your audio (P2P only)

---

## 📁 Files You Have

```
call-with-code.html        ← Open this (the app)
code-call-server.js        ← The backend (run this)
.env                       ← Your API key (create this)
CALL-WITH-CODE-SETUP.md    ← Full setup guide
```

---

## ✅ Quick Checklist

- [ ] .env file created with API key
- [ ] Server running (`node code-call-server.js`)
- [ ] App opens (`localhost:3000`)
- [ ] Can generate code
- [ ] Can enter code
- [ ] Can start call
- [ ] See live transcription

**All checked? You're ready!** 🚀

---

## 🚀 Next: Deploy to Internet (Optional)

Want to call people outside your WiFi network?

```bash
# Option 1: Ngrok (Free)
ngrok http 3000
# Then share: https://abc123.ngrok.io

# Option 2: Heroku (Easy)
# See: DEPLOYMENT.md

# Option 3: DigitalOcean ($5/month)
# See: DEPLOYMENT.md
```

---

## 📞 Support

**API Issues?**
- Deepgram Docs: https://developers.deepgram.com
- Get API key: https://console.deepgram.com

**Code Issues?**
- Check browser console: F12
- Check server logs (terminal where you ran node)
- Verify .env file has API key

**Can't connect?**
- Make sure server is running
- Make sure on same network (if local)
- Clear browser cache (Ctrl+Shift+Delete)
- Try different browser

---

**Questions?** Check `CALL-WITH-CODE-SETUP.md` for detailed docs.

**Ready to call?** Open `call-with-code.html` now! 📱✅
