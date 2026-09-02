# 💰 Deepgram Pricing & Usage Guide

## Your Current Situation

You have a **free Deepgram tier** with:

- **600 minutes/month** (resets on the 1st of each month)
- **$0 cost** (completely free for testing)
- **Real-time transcription** with Deepgram's best model (nova-2)

---

## 📊 Usage Tracking

The app now displays:

- **Minutes used this month** (automatically fetches from Deepgram API)
- **Minutes remaining** (600 - used)
- **Percentage bar** (visual indicator)
- **Warning** when below 50 minutes left

✅ **Automatically updates** when you activate transcription!

---

## ❌ What Happens When You Hit 600 Minutes?

### Scenario 1: Still on Free Tier

```
Status: Service STOPS ❌
Error: "API returned 429 - Quota Exceeded"
Result: No transcription appears
Solution: Upgrade to paid plan OR wait until next month
```

### Scenario 2: Paid Plan Active

```
Status: Service CONTINUES ✅
Billing: Charged automatically
Rate: $0.0043 per minute
Example: 1 hour call = 60 min × $0.0043 = $0.26
```

---

## 💵 Pricing Tiers

### Free Tier (Recommended for Testing)

- **Cost**: $0/month
- **Limit**: 600 minutes/month
- **When exceeded**: Service stops
- **Best for**: Personal testing, evaluation
- **Usage**: ~20 minutes/day

### Pay-as-You-Go (Most Flexible)

- **Cost**: $0.0043/minute (after 100 free min/month)
- **Limit**: Unlimited
- **When exceeded**: Nothing, just charged
- **Best for**: Production with variable usage
- **Usage**: As much as you need

### Pro Plan (High Volume)

- **Cost**: $500/month
- **Limit**: Unlimited
- **When exceeded**: Nothing, all included
- **Best for**: Companies, continuous usage
- **Usage**: 1000+ hours/month

---

## 📈 Cost Examples

### Monthly Usage Scenarios

| Usage          | Free Tier | Pay-as-You-Go | Pro Plan |
| -------------- | --------- | ------------- | -------- |
| 100 min/month  | $0 ✅     | $0 (included) | $500     |
| 300 min/month  | $0 ✅     | $1.29         | $500     |
| 600 min/month  | $0 ✅     | $2.58         | $500     |
| 1000 min/month | ❌ STOP   | $4.30         | $500     |
| 2000 min/month | ❌ STOP   | $8.60         | $500     |

### Real-world Examples

**Use Case 1: Personal Testing (10 min/day)**

- Minutes/month: 300
- Free tier cost: $0 ✅
- Conclusion: Free tier is enough

**Use Case 2: Daily Team Calls (30 min/day)**

- Minutes/month: 900
- Free tier: Hit limit by day 20
- Pay-as-you-go cost: $3.87/month
- Conclusion: Use pay-as-you-go

**Use Case 3: Enterprise (8 hours/day)**

- Minutes/month: 12,000
- Free tier: Hit limit by day 1
- Pay-as-you-go cost: $51.60/month
- Pro plan cost: $500/month (better value)
- Conclusion: Upgrade to Pro Plan

---

## 🔔 How App Shows Usage Now

### At Setup

1. Enter Deepgram API key
2. Click "Setup Deepgram"
3. App fetches your usage stats
4. Shows:

   ```
   📊 Monthly Usage (2026-09)
   Used: 145 / 600 minutes (24%)
   ▯▯▯▯░░░░░░░░░░░░░░░░░░  (progress bar)
   Remaining: 455 minutes

   ⚠️ Warning (if < 50 min left):
   Low on free tier minutes. Upgrade plan
   ```

### Warning Levels

- 🟢 **Green** (> 50% remaining): You're good
- 🟡 **Yellow** (20-50% remaining): Approaching limit
- 🔴 **Red** (< 20% remaining): Almost out, upgrade soon

---

## 🔄 How Deepgram Minute Calculation Works

### 1 Minute = ?

- 60 seconds of **audio processing**
- Real-time or batch transcription
- Partial results + final results

### What Counts?

✅ **COUNTS TOWARD LIMIT:**

- Audio you transcribe (in seconds = minutes)
- Even if you stop mid-call
- Both sent and received audio

❌ **DOESN'T COUNT:**

- Setup/configuration API calls
- Invalid API key checks
- API errors (usage still counted though)
- Viewing past transcriptions

### Example:

- 10-minute call between 2 people
- Both directions transcribed = 10 minutes used
- In group (3 people): Each stream = 10 minutes
- Total: 30 minutes for one 10-min group call

---

## 💳 How to Upgrade

### Step 1: Go to Deepgram Console

https://console.deepgram.com/billing

### Step 2: Add Payment Method

- Credit card or PayPal
- No commitment (cancel anytime)

### Step 3: Select Plan

```
Free Tier (600 min/month)
  ↓
Pay-as-You-Go ($0.0043/min)  ← Recommended next step
  ↓
Pro Plan ($500/month)
```

### Step 4: Confirm

- Billing starts immediately
- Monthly statement emailed
- Can downgrade anytime

---

## ⚠️ Things to Know

### Overage Charges

- **No surprise charges** with free tier
- Service simply stops
- With paid plan: Charges apply daily
- Can set monthly spending limits

### Refunds & Credits

- No refunds for unused balance
- Can request credit for errors
- Contact Deepgram support

### Monthly Reset

- Limit resets **1st of each month** at 12:00 AM UTC
- Usage shows current calendar month
- Can't "save" unused minutes for next month

### API Key Security

- Don't share your API key
- Treat like password
- Regenerate if exposed
- Monitor usage for unusual activity

---

## 🚨 Error Messages & Solutions

### "API returned 429 - Quota Exceeded"

**Cause**: Used up 600 free minutes
**Solution**:

- Upgrade to paid plan, OR
- Wait until next month (1st)
- Check usage to confirm

### "API returned 401 - Unauthorized"

**Cause**: Invalid/expired API key
**Solution**:

- Copy correct API key from console
- Regenerate key if needed
- Check for extra spaces/characters

### "API returned 403 - Forbidden"

**Cause**: Key doesn't have permission
**Solution**:

- Make sure it's a project API key (not account key)
- Check permissions in console
- Regenerate if needed

---

## 📱 Free Tier Recommendations

### Good Use Cases for Free Tier

- ✅ Learning / testing / development
- ✅ Internal company calls (limited)
- ✅ Occasional personal use
- ✅ Small teams (2-3 people)
- ✅ Daily meetings < 20 minutes

### When to Upgrade

- ❌ Production use (reliability)
- ❌ Customer-facing features
- ❌ More than 20 min/day usage
- ❌ Multiple concurrent calls
- ❌ Want to avoid service interruptions

---

## 📊 Quick Decision Tree

```
How much do you need transcription?

┌─ < 30 min/month? → Stay on FREE TIER ✅
│
├─ 30-600 min/month? → FREE TIER works ✅
│
├─ 600-2000 min/month? → Upgrade to PAY-AS-YOU-GO 💳
│   ($0-$10/month typically)
│
└─ > 2000 min/month? → Consider PRO PLAN 📊
    ($500/month for unlimited)
```

---

## 🎯 Next Steps

1. **Start using the app**
   - Open `realtime-transcription.html` or `group-transcription.html`
   - Check how many minutes you've used

2. **Monitor usage monthly**
   - App shows remaining minutes at setup
   - Check Deepgram console anytime: https://console.deepgram.com

3. **If approaching limit**
   - Decide: Pay for more, or wait for reset
   - Upgrade: 2 clicks in Deepgram console
   - Total setup time: < 1 minute

4. **For production**
   - Move API key to server (for security)
   - Add database to store transcriptions
   - Set spending alerts in Deepgram console

---

## 🔗 Useful Links

- **Deepgram Console**: https://console.deepgram.com
- **Billing & Usage**: https://console.deepgram.com/billing
- **API Documentation**: https://developers.deepgram.com
- **Pricing Details**: https://deepgram.com/pricing
- **Support**: https://support.deepgram.com

---

## 📞 Support

**If something goes wrong:**

1. Check your API key is correct
2. Verify usage limit hasn't been hit
3. Check Deepgram status: https://status.deepgram.com
4. Contact Deepgram support: support@deepgram.com

**If you need help:**

- See README.md for technical setup
- See DEPLOYMENT.md for deployment help
- See QUICKSTART.md for fastest way to start

---

**Last Updated**: September 2, 2026
**Status**: All features implemented ✅
