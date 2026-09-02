# 🚀 Multi-API Setup Guide - Complete Instructions

## What You're Getting

A complete transcription system with **automatic fallback** between 3 free APIs:

1. **Deepgram** (600 min/month) - Primary
2. **Speechmatics** (100 min/month) - Secondary
3. **Whisper** (Unlimited) - Fallback

**Total: 700+ minutes per month, completely FREE!**

---

## 📋 Prerequisites

- Node.js (v14+) - Download from https://nodejs.org
- Git (for version control)
- 3 API keys (free to generate)

---

## ⚡ Quick Start (30 minutes)

### Step 1: Get API Keys (15 min)

#### Deepgram (Primary - 600 min/month)

```
1. Go to https://console.deepgram.com
2. Sign up (free account)
3. Navigate to "API Keys"
4. Click "Create API Key"
5. Copy the key (starts with "sk-")
6. Save it: sk-1234567890...
```

#### Speechmatics (Secondary - 100 min/month)

```
1. Go to https://www.speechmatics.com/signup
2. Sign up (free tier)
3. Go to "Settings" → "API Keys"
4. Create new API key
5. Copy key and save it
```

#### Whisper (Tertiary - Unlimited)

```
1. Install Python first:
   https://www.python.org/downloads/

2. Open PowerShell and run:
   pip install openai-whisper

3. That's it! No API key needed.
   (Whisper runs locally on your computer)
```

### Step 2: Setup Environment Variables (5 min)

```bash
# Navigate to project directory
cd d:\Transcription

# Create .env file
# Copy content from .env.example and add your API keys

# Windows (PowerShell):
Copy-Item .env.example .env
```

**Edit `.d:\Transcription\.env`:**

```
DEEPGRAM_API_KEY=sk-1234567890...
SPEECHMATICS_API_KEY=your-speechmatics-key...
PORT=3000
NODE_ENV=production
```

### Step 3: Install Dependencies (5 min)

```bash
cd d:\Transcription

# Install Node.js packages
npm install

# Install Python Whisper (one-time)
pip install openai-whisper
```

### Step 4: Start Server (2 min)

```bash
# Terminal 1: Start the server
npm start

# You should see:
# 🚀 Multi-API Transcription Server
# 📍 URL: http://localhost:3000
```

### Step 5: Open App (2 min)

**In Browser:**

1. Open `multi-api-transcription.html`
2. Enter server URL: `http://localhost:3000`
3. Click "Connect to Server"
4. Click "Enable Microphone"
5. Start speaking → See real-time transcription!

---

## 🔍 Detailed API Setup

### Deepgram Setup (Recommended)

**Why Deepgram?**

- 600 minutes free/month (best free tier)
- 95% accuracy (excellent)
- Real-time (~250ms latency)
- Easy setup (2 minutes)

**Steps:**

1. Go to https://console.deepgram.com
2. Click "Sign up" (or log in)
3. Complete email verification
4. Dashboard → "API Keys" in left menu
5. Click "+ Create API Key"
6. Copy the key (format: `sk-xxxxxxxx`)
7. Paste in `.env` file:
   ```
   DEEPGRAM_API_KEY=sk-xxxxxxxx
   ```

**Verify:**

```bash
# Test Deepgram connection
curl -X GET "https://api.deepgram.com/v1/speak" \
  -H "Authorization: Token sk-xxxxxxxx"
# Should return 200 or 400, not 401
```

---

### Speechmatics Setup (Fallback)

**Why Speechmatics?**

- 100 minutes free/month
- 95% accuracy (same as Deepgram)
- Real-time support
- Good for backup

**Steps:**

1. Go to https://www.speechmatics.com/signup
2. Sign up with email
3. Verify email address
4. Log in to dashboard
5. Settings → API Keys
6. Create new API key
7. Copy the key
8. Paste in `.env`:
   ```
   SPEECHMATICS_API_KEY=your-key-here
   ```

**Verify:**

```bash
# Test Speechmatics
curl -X GET "https://api.speechmatics.com/v2/billing" \
  -H "Authorization: Bearer your-key-here"
# Should return billing info
```

---

### Whisper Setup (Ultimate Fallback)

**Why Whisper?**

- UNLIMITED usage (free forever)
- No API key needed
- Runs locally (more private)
- 87% accuracy (still excellent)

**Steps:**

1. **Install Python** (if not already installed)

   ```bash
   # Download: https://www.python.org/downloads/
   # Click "Install Python"
   # CHECK: "Add Python to PATH"
   ```

2. **Install Whisper**

   ```bash
   pip install openai-whisper

   # Verify installation
   whisper --version
   # Should output: openai-whisper version x.x.x
   ```

3. **Download Model** (first run)
   ```bash
   # Whisper will auto-download model on first use
   # Models available: tiny, base, small, medium, large
   # Recommended: base (fastest for real-time)
   ```

**Test Whisper:**

```bash
# Create a test audio file (or use existing)
whisper audio.wav --model base --language en

# Should output transcription
```

---

## 🎯 How Fallback Works

### Automatic Priority Order:

```
User speaks
    ↓
1. Try Deepgram (has quota?)
    ├─ YES → Transcribe with Deepgram ✅
    └─ NO → Continue to #2
    ↓
2. Try Speechmatics (has quota?)
    ├─ YES → Transcribe with Speechmatics ✅
    └─ NO → Continue to #3
    ↓
3. Use Whisper (unlimited) ✅
    └─ Transcribe with Whisper
```

### Example Timeline:

```
Sept 1-22:  Use Deepgram (600 min available)
Sept 22:    Deepgram exhausted → Switch to Speechmatics
Sept 30:    Speechmatics exhausted → Switch to Whisper
Oct 1:      Deepgram resets → Back to Deepgram
```

---

## 📊 Monitoring Usage

### Check Usage in Real-time:

**Via App UI:**

- Open `multi-api-transcription.html`
- See live dashboard showing:
  - Minutes used/remaining for each API
  - Current active API
  - Usage percentage
  - Alerts when running low

**Via REST API:**

```bash
# Get status of all APIs
curl http://localhost:3000/api/status

# Response:
{
  "deepgram": {
    "used": 150,
    "limit": 600,
    "remaining": 450,
    "percentUsed": 25
  },
  "speechmatics": {
    "used": 20,
    "limit": 100,
    "remaining": 80,
    "percentUsed": 20
  },
  "whisper": {
    "used": 0,
    "limit": -1,
    "remaining": -1,
    "percentUsed": 0
  }
}
```

---

## 🔄 Monthly Reset Schedule

Each API resets on the **1st of each month at 00:00 UTC:**

| API          | Free Tier Reset        |
| ------------ | ---------------------- |
| Deepgram     | 1st of each month      |
| Speechmatics | 1st of each month      |
| Whisper      | N/A (always unlimited) |

**Example:**

```
Sept 30: Deepgram has 0 min left
Oct 1 00:00 UTC: Deepgram resets to 600 min
```

---

## ⚙️ Configuration

### .env File Options

```env
# Required
DEEPGRAM_API_KEY=sk-1234567890...
SPEECHMATICS_API_KEY=your-key...

# Optional
PORT=3000
NODE_ENV=production
WHISPER_MODEL=base  # tiny, base, small, medium, large
MAX_CONCURRENT_TRANSCRIPTIONS=5
USAGE_CHECK_INTERVAL=10000  # milliseconds
```

### Whisper Model Options

| Model  | Size | Speed  | Accuracy | RAM  |
| ------ | ---- | ------ | -------- | ---- |
| tiny   | 139M | ⚡⚡⚡ | 84%      | 1GB  |
| base   | 140M | ⚡⚡   | 87%      | 1GB  |
| small  | 244M | ⚡     | 88%      | 2GB  |
| medium | 769M | ~      | 90%      | 5GB  |
| large  | 2.9G | ~~     | 95%      | 10GB |

**Recommended for real-time: `base`**

---

## 🛠️ Testing

### Test Single API

**Test Deepgram:**

```bash
curl -X POST "https://api.deepgram.com/v1/listen" \
  -H "Authorization: Token sk-..." \
  -H "Content-Type: application/octet-stream" \
  --data-binary @audio.wav
```

**Test Speechmatics:**

```bash
curl -X POST "https://api.speechmatics.com/v2/jobs" \
  -H "Authorization: Bearer ..." \
  -F "audio=@audio.wav"
```

**Test Whisper:**

```bash
whisper audio.wav --model base --language en
```

### Test Full System

1. Start server:

   ```bash
   npm start
   ```

2. Open app in browser:

   ```
   file:///d:/Transcription/multi-api-transcription.html
   ```

3. Connect to server:
   - URL: `http://localhost:3000`
   - Click "Connect"

4. Enable microphone and test

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"

```bash
cd d:\Transcription
npm install
npm start
```

### "Invalid API key"

- Check `.env` file for typos
- Make sure key starts with `sk-` (Deepgram) or provided key (Speechmatics)
- Regenerate key in console if needed

### "Port 3000 already in use"

```bash
# Use different port
set PORT=3001
npm start

# Or kill process using port
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### "Whisper not found"

```bash
# Reinstall
pip uninstall openai-whisper
pip install openai-whisper

# Verify
whisper --version
```

### "Microphone not working"

- Check browser permissions (Settings → Microphone)
- Ensure app is on HTTPS (for production)
- Try different browser (Chrome, Firefox, Safari)
- Check microphone is not used by another app

### "No transcription appearing"

1. Check all API keys in `.env`
2. Verify keys are valid
3. Check free tier usage limit
4. Check browser console (F12) for errors
5. Verify server is running

---

## 📱 Using on Mobile

### Same WiFi Network:

1. Find your computer's IP:

   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address: 192.168.1.xxx
   ```

2. On phone (same WiFi):
   - Open browser
   - Go to: `http://192.168.1.xxx:3000`
   - Open `multi-api-transcription.html`
   - Enter server URL: `http://192.168.1.xxx:3000`
   - Connect and test

### Over Internet (Advanced):

1. Get dynamic DNS domain
2. Forward port 3000 to your computer
3. Use domain instead of IP
4. Use HTTPS (required for production)

---

## 🔐 Security Best Practices

### For Development:

- Keep API keys in `.env` (not in code)
- Don't commit `.env` to GitHub
- Use local network only

### For Production:

1. Move API keys to environment variables (server hosting)
2. Enable HTTPS/SSL
3. Add authentication (login required)
4. Rate limit API calls
5. Log all transcriptions
6. Add user authentication
7. Encrypt stored data

**Example for production (.env on server):**

```bash
# On Heroku, DigitalOcean, AWS:
# Set environment variables in dashboard
# DO NOT include in .env file
DEEPGRAM_API_KEY=sk-...
SPEECHMATICS_API_KEY=...
```

---

## 📈 Performance Tips

1. **For Real-time:**
   - Use `base` Whisper model (smallest/fastest)
   - Use Deepgram first (lowest latency)
   - Reduce chunk size for faster processing

2. **For Accuracy:**
   - Use `large` Whisper model (most accurate)
   - Use Deepgram Nova model (best accuracy)
   - Allow longer processing time

3. **For Cost:**
   - Maximize free tier usage
   - Use Whisper fallback (unlimited)
   - Monitor usage monthly

---

## 🚀 Deployment Options

### Option 1: Local Only (Testing)

- No deployment needed
- Run on your computer
- Limited to local network

### Option 2: Heroku (Production)

```bash
heroku create your-app
git push heroku main
```

### Option 3: DigitalOcean (Recommended)

- $5-20/month
- Full control
- Scalable
- See DEPLOYMENT.md for details

### Option 4: Vercel + Backend

- Vercel for frontend
- Heroku/DigitalOcean for backend

---

## 📞 Getting Help

**API Documentation:**

- Deepgram: https://developers.deepgram.com
- Speechmatics: https://docs.speechmatics.com
- Whisper: https://github.com/openai/whisper

**Support:**

- Deepgram Support: https://support.deepgram.com
- Speechmatics Support: https://support.speechmatics.com
- Python Whisper: GitHub issues

---

## ✅ Setup Verification Checklist

- [ ] Python installed (`python --version`)
- [ ] Node.js installed (`node --version`)
- [ ] Deepgram API key obtained and tested
- [ ] Speechmatics API key obtained and tested
- [ ] Whisper installed (`pip install openai-whisper`)
- [ ] `.env` file created with API keys
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm start`)
- [ ] App opens in browser
- [ ] Can connect to server
- [ ] Microphone permission granted
- [ ] Transcription appears when you speak

**All checked? You're ready to use!** 🎉

---

## 🎯 Next Steps

1. **Start server:** `npm start`
2. **Open app:** `multi-api-transcription.html`
3. **Connect:** Enter server URL
4. **Test:** Enable microphone and speak
5. **Monitor:** Watch API usage in dashboard
6. **Enjoy:** Unlimited free transcription!

---

**Last Updated**: September 2, 2026
**Status**: Ready to Deploy ✅
