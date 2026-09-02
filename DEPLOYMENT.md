# 🚀 Deployment Guide - Real-Time Call Transcription

## Option 1: Vercel (Frontend Only - Recommended for Quick Testing)

### Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub account

### Deploy Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add transcription app"
   git push origin main
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```
   Follow prompts to connect GitHub

3. **Use the App**
   - Open your Vercel deployment URL
   - Enter Deepgram API key
   - Enable microphone

**Limitations**: 
- Only works for 2 people without a signaling server
- Need manual SDP exchange for peer connection

---

## Option 2: Heroku (Full Stack - With Signaling Server)

### Prerequisites
- Heroku account (free at https://heroku.com)
- Git installed
- Node.js installed locally

### Deploy Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-transcription-app
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

4. **Check Status**
   ```bash
   heroku logs --tail
   ```

5. **Get App URL**
   ```bash
   heroku open
   ```

### Update Client for Heroku
In `realtime-transcription.html`, change:
```javascript
const socket = io('https://your-transcription-app.herokuapp.com');
```

**Cost**: Free tier (with limitations), $7+/month for production

---

## Option 3: DigitalOcean (Best for Production)

### Prerequisites
- DigitalOcean account ($5-10/month)
- SSH access
- Domain name (optional but recommended)

### Deploy Steps

1. **Create Droplet**
   - DigitalOcean Dashboard → Create Droplet
   - Choose: Ubuntu 20.04, $5/month plan
   - Add your SSH key

2. **SSH into Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y npm
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/Transcription.git
   cd Transcription
   npm install
   ```

5. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot certonly --standalone -d your-domain.com
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt-get install -y nginx
   ```
   
   Create `/etc/nginx/sites-available/transcription`:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/transcription /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Start Node Server with PM2**
   ```bash
   npm install -g pm2
   pm2 start signaling-server.js --name transcription
   pm2 save
   sudo env PATH=$PATH:/usr/local/bin pm2 startup -u root --hp /root
   ```

8. **Setup Auto-renewal for SSL**
   ```bash
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer
   ```

### Access Your App
- Frontend: https://your-domain.com
- API: https://your-domain.com/api
- Health: https://your-domain.com/health

---

## Option 4: AWS (EC2 + ALB)

### Prerequisites
- AWS account
- Knowledge of AWS services

### Deploy Steps

1. **Launch EC2 Instance**
   - AMI: Ubuntu 20.04 LTS
   - Instance type: t2.micro (free tier eligible)
   - Security group: Allow 80, 443, 3000

2. **SSH and Setup**
   ```bash
   sudo apt-get update
   sudo apt-get install -y nodejs npm
   git clone https://github.com/your-username/Transcription.git
   cd Transcription && npm install
   npm start
   ```

3. **Setup Application Load Balancer (ALB)**
   - Target group: EC2 instance on port 3000
   - SSL certificate: AWS Certificate Manager (free)

4. **Enable Auto-scaling**
   - Create Auto Scaling Group
   - Scale 1-3 instances based on CPU

### Cost
- EC2: $0-10/month (free tier eligible)
- ALB: $16-20/month
- Data transfer: $0.09/GB

---

## Option 5: Local Network (Testing)

### Prerequisites
- Windows/Mac/Linux
- Node.js installed
- Same WiFi network as clients

### Setup Steps

1. **Find Your IP Address**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
   Look for IPv4 address (e.g., 192.168.1.100)

2. **Start Server**
   ```bash
   npm start
   ```
   Server runs on `http://192.168.1.100:3000`

3. **Open on Mobile**
   - On same WiFi, open browser
   - Navigate to `http://192.168.1.100:3000`
   - Test the app

**Note**: Microphone access requires HTTPS. For local testing:
- Use `localhost` on same machine
- Or setup self-signed certificate (advanced)

---

## Option 6: Docker (Any Cloud Provider)

### Dockerfile
```dockerfile
FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "signaling-server.js"]
```

### Build and Run Locally
```bash
docker build -t transcription-app .
docker run -p 3000:3000 transcription-app
```

### Deploy to Any Docker-Enabled Service
- **Docker Hub**: Push image, deploy anywhere
- **AWS ECS**: Elastic Container Service
- **Google Cloud Run**: Serverless containers
- **Azure Container Instances**: Pay per second

---

## SSL/HTTPS Setup

### For Production (Required)
Always use HTTPS for:
- Microphone access (required by browsers)
- Security (encrypt audio transmission)
- WebSocket upgrade (required)

### Free SSL Certificate
```bash
# Using Let's Encrypt (recommended)
sudo certbot certonly --standalone -d your-domain.com

# Or use Cloudflare (free with CDN)
# Add DNS record and enable SSL in Cloudflare dashboard
```

---

## Monitoring & Logging

### View Logs
```bash
# Heroku
heroku logs --tail

# DigitalOcean/AWS
pm2 logs
tail -f ~/.pm2/logs/transcription-error.log

# Docker
docker logs -f container_name
```

### Performance Monitoring
```bash
# Add to signaling-server.js
const os = require('os');
setInterval(() => {
  console.log(`Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  console.log(`Active sessions: ${sessions.size}`);
}, 60000);
```

### Set Up Alerts
- **PagerDuty**: Get notifications on errors
- **Sentry**: Track exceptions
- **Uptime Monitor**: Check server availability

---

## Cost Comparison

| Provider | Cost | Scalability | Ease of Setup |
|----------|------|-------------|--------------|
| Vercel | Free | Limited | ⭐⭐⭐⭐⭐ |
| Heroku | Free-$7+ | Good | ⭐⭐⭐⭐ |
| DigitalOcean | $5-20 | Excellent | ⭐⭐⭐ |
| AWS | $10-100+ | Excellent | ⭐⭐ |
| Local | $0 | Limited | ⭐⭐⭐ |

---

## Production Checklist

- [ ] HTTPS/SSL enabled
- [ ] API key on server (not in client code)
- [ ] Database backup configured
- [ ] Error tracking (Sentry)
- [ ] Monitoring/alerts enabled
- [ ] Automated backups
- [ ] Load testing completed
- [ ] Security audit done
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Transcription logs encrypted
- [ ] Privacy policy posted
- [ ] Terms of service posted
- [ ] GDPR compliance checked

---

## Troubleshooting Deployments

### "Cannot find module 'express'"
```bash
rm -rf node_modules
npm install
npm start
```

### "WebSocket connection failed"
- Check CORS settings
- Verify Socket.io allowed origins
- Check firewall/proxy settings

### "Microphone not working"
- Deployment must use HTTPS
- Check browser permissions
- Test on https://localhost (local)

### "High memory usage"
- Check for memory leaks in transcription code
- Monitor with `pm2 monit`
- Restart server regularly

---

## Maintenance

### Regular Tasks
- Weekly: Check logs for errors
- Monthly: Update dependencies (`npm update`)
- Quarterly: Security audit
- Annually: Renew SSL certificate

### Updates
```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update major versions
npm install npm@latest -g
npm install express@latest
```

---

**Ready to deploy? Start with Option 1 (Vercel) for quick testing, then move to Option 2 (Heroku) or Option 3 (DigitalOcean) for production!**
