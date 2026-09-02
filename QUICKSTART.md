# 🎯 Quick Start Guide - 5 Minute Setup

## What You Have

A complete **real-time phone call transcription system** that works on mobile and desktop:
- **2-person calls**: `realtime-transcription.html`
- **Group calls (3-4 people)**: `group-transcription.html`
- **Signaling server**: `signaling-server.js` (for production)
- **Documentation**: README.md, DEPLOYMENT.md

---

## ⚡ Fastest Way to Test (5 minutes)

### Step 1: Get API Key (2 min)
1. Go to https://console.deepgram.com
2. Sign up (free)
3. Get API key

### Step 2: Open App (1 min)
- Download `realtime-transcription.html`
- Open in browser (Firefox, Chrome, Safari, Edge)

### Step 3: Test (2 min)
1. Enter your name
2. Paste Deepgram API key
3. Click "Activate Transcription"
4. Allow microphone access
5. Start speaking → See real-time transcription!

---

## 📱 To Use on Mobile

1. **iPhone (Safari)**
   - Open app in Safari
   - Allow microphone permission
   - Test with headset/speaker

2. **Android (Chrome)**
   - Open app in Chrome
   - Allow microphone permission
   - Use WiFi for better results

---

## 🤝 To Connect 2 People (Advanced)

### Without Server (Manual)
1. Both open the app in browser
2. Share your "Peer ID"
3. Paste their ID
4. Advanced: Exchange SDP offers (technical)

### With Server (Easy - Production)
1. Deploy signaling server (see DEPLOYMENT.md)
2. Both open group transcription app
3. Generate session ID in first app
4. Share session ID with second person
5. Second person joins → Instant connection!

---

## 🚀 Deploy to Internet (Optional)

### Easiest (10 min)
```bash
npm install -g vercel
vercel
# Done! Share URL with anyone
```

### Production (30 min)
```bash
npm install
npm start
# Deploy to Heroku or DigitalOcean (see DEPLOYMENT.md)
```

---

## ❓ Questions?

| Question | Answer |
|----------|--------|
| What's Deepgram? | AI service that converts speech to text in real-time (~250ms) |
| Free tier limit? | 600 minutes/month (enough to test) |
| Does it work offline? | No, needs internet for Deepgram transcription |
| How many people? | 2-4 simultaneously |
| Which devices? | Any: iPhone, Android, Mac, Windows, Linux |
| Do I need a server? | No for 2 people (manual). Yes for 3+ (see group app) |
| Is it secure? | Yes, P2P audio + encrypted connection |

---

## 📂 File Guide

```
📁 d:\Transcription\
├── 🌐 realtime-transcription.html  ← Start here for 2 people!
├── 👥 group-transcription.html     ← For 3-4 people with server
├── ⚙️ signaling-server.js          ← Backend for groups
├── 📖 README.md                    ← Full documentation
├── 🚀 DEPLOYMENT.md                ← How to deploy online
└── 📋 QUICKSTART.md                ← This file
```

---

## 🔄 Next Steps

1. **Test locally** → Open HTML in browser + enter API key
2. **Test on mobile** → Share URL or use local IP
3. **Deploy online** → Use Vercel (easiest) or Heroku
4. **Add features** → Modify HTML to customize

---

## 💡 Pro Tips

- **Noisy environment?** Use headset with mic
- **Better accuracy?** Speak clearly, avoid background noise
- **Multiple calls?** Each needs new session ID
- **Save transcripts?** Add database (see README.md)
- **Add video?** Change settings in getUserMedia() call

---

## 🆘 Common Issues

**"Microphone not working"**
→ Check browser permissions (Settings → Microphone)

**"No transcription appearing"**
→ Verify Deepgram API key is correct

**"Can't connect peer"**
→ For manual connection, need advanced SDP setup. Use server instead.

**"It's slow"**
→ Check internet speed, try WiFi instead of mobile data

---

## 🎓 How It Works (Simple Version)

```
1. You speak
   ↓
2. Your browser captures audio
   ↓
3. Audio sent to Deepgram API
   ↓
4. Deepgram transcribes (AI)
   ↓
5. Transcription shown on screen
   ↓
6. Other person sees YOUR transcript
```

For group calls, add signaling server between step 5-6 to coordinate connections.

---

## 🎯 Success Checklist

- [ ] Deepgram API key obtained
- [ ] App opened in browser
- [ ] Microphone permission allowed
- [ ] Transcription showing when you speak
- [ ] Can see both speakers' text
- [ ] Works on mobile phone
- [ ] App deployed online (optional)

**Everything checked? You're ready to use it! 🎉**

---

## 🔗 Useful Links

- Deepgram Console: https://console.deepgram.com
- WebRTC Guide: https://webrtc.org/
- Vercel Deploy: https://vercel.com
- GitHub Repo: https://github.com/KS441-ctrl/Transcription

---

**Last Updated**: September 2, 2026
**Status**: Ready to Use ✅
