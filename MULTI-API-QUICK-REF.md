# ⚡ Multi-API Quick Reference

## What's Installed

**3 Free Speech-to-Text APIs with Automatic Fallback:**

| API              | Free Tier     | Fallback Order | Setup Time |
| ---------------- | ------------- | -------------- | ---------- |
| **Deepgram**     | 600 min/mo    | 1st (Primary)  | 2 min      |
| **Speechmatics** | 100 min/mo    | 2nd            | 5 min      |
| **Whisper**      | ∞ (Unlimited) | 3rd (Ultimate) | 10 min     |

**Total: 700+ min/month FREE!** 💰

---

## 🚀 5-Minute Startup

### 1. Get API Keys (3 min)

**Deepgram:**

- Go to https://console.deepgram.com → API Keys
- Create key, copy it

**Speechmatics:**

- Go to https://www.speechmatics.com → API Keys
- Create key, copy it

**Whisper:**

- Run: `pip install openai-whisper`

### 2. Create .env File (1 min)

```env
DEEPGRAM_API_KEY=sk-your-key-here
SPEECHMATICS_API_KEY=your-key-here
```

### 3. Start (1 min)

```bash
npm install
npm start
```

---

## 📊 Check Usage

Open `multi-api-transcription.html` to see:

- How many minutes used
- How many remaining
- Which API is active
- Alerts when running low

---

## 🔄 How Fallback Works

```
You speak
   ↓
1. Deepgram (600 min available?) → YES, use it ✅
   ↓ (if quota exceeded)
2. Speechmatics (100 min available?) → YES, use it ✅
   ↓ (if quota exceeded)
3. Whisper (Unlimited) → Always available ✅
```

---

## 💡 Example Scenarios

**Scenario 1: Early Month**

- Deepgram: 500 min left
- Speechmatics: 80 min left
- Using: Deepgram (best quality)
- Cost: $0 ✅

**Scenario 2: Mid Month (Deepgram exhausted)**

- Deepgram: 0 min left
- Speechmatics: 50 min left
- Using: Speechmatics (auto-switched)
- Cost: $0 ✅

**Scenario 3: Late Month (All exhausted)**

- Deepgram: 0 min left
- Speechmatics: 0 min left
- Using: Whisper (unlimited)
- Cost: $0 ✅
- Trade-off: 2-5 sec delay (vs real-time)

---

## 🔧 Common Commands

```bash
# Start server
npm start

# Check all API status
curl http://localhost:3000/api/status

# Test one API
whisper audio.wav --model base

# Check Deepgram usage
curl -H "Authorization: Token sk-..." https://api.deepgram.com/v1/usage

# View logs
npm start 2>&1 | tee server.log
```

---

## 📋 Troubleshooting

| Problem           | Solution                         |
| ----------------- | -------------------------------- |
| API key invalid   | Check .env, regenerate key       |
| Port 3000 in use  | `set PORT=3001 && npm start`     |
| Whisper not found | `pip install openai-whisper`     |
| No transcription  | Check console (F12), verify keys |

---

## 🎯 Files You Need

| File                           | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `multi-api-server.js`          | Backend (handles 3 APIs)            |
| `multi-api-transcription.html` | Frontend (app UI)                   |
| `.env`                         | API keys (create from .env.example) |
| `package.json`                 | Dependencies                        |

---

## 💻 System Requirements

- Node.js v14+
- Python 3.9+ (for Whisper)
- 1GB RAM minimum
- Internet connection
- Microphone

---

## 🌐 Access Points

**Local:**

- App: `file:///d:/Transcription/multi-api-transcription.html`
- Server: `http://localhost:3000`

**Mobile (Same WiFi):**

- App: `http://192.168.1.xxx:3000/multi-api-transcription.html`
- Replace `xxx` with your computer's IP

---

## 📱 Mobile Usage

**iPhone (Safari):**

1. Connect to WiFi with server
2. Open browser
3. Go to: `http://192.168.1.100:3000`
4. Open `multi-api-transcription.html`
5. Allow microphone
6. Done!

**Android (Chrome):**

1. Same steps as iOS
2. Use Chrome instead of Safari

---

## 💰 Monthly Budget (All Free)

- **Deepgram**: 600 min free
- **Speechmatics**: 100 min free
- **Whisper**: Unlimited free
- **Total**: 700+ min/month
- **Cost**: $0

---

## 🔔 Alerts

App shows alerts for:

- ⚠️ API quota exhausted
- ⚠️ Low remaining minutes (< 50)
- ⚠️ Automatic API switch
- ✅ Which API is currently active

---

## 📞 Need Help?

**Setup Issue?**

- See: `MULTI-API-SETUP.md` (detailed)

**API Problem?**

- Deepgram: https://support.deepgram.com
- Speechmatics: https://support.speechmatics.com
- Whisper: https://github.com/openai/whisper

**Code Problem?**

- Check `.env` file
- Check browser console (F12)
- Check server logs

---

## ✅ Quick Checklist

- [ ] APIs keys obtained (Deepgram + Speechmatics)
- [ ] `.env` file created with keys
- [ ] `npm install` run
- [ ] `npm start` works (see "Multi-API Transcription Server")
- [ ] Browser opens app at `localhost:3000`
- [ ] Can connect to server (green status)
- [ ] Can enable microphone (no permission error)
- [ ] Speaks → See transcription appear
- [ ] Check API usage dashboard

**All done? You're set!** 🎉

---

## 🚀 Next: Deploy to Internet (Optional)

Once working locally, deploy to:

- **Heroku** (easiest)
- **DigitalOcean** (cheapest)
- **AWS** (most powerful)

See `DEPLOYMENT.md` for instructions.

---

**Remember:** You have 700+ minutes per month completely FREE!
Switch to Whisper when others run out for unlimited transcription.
