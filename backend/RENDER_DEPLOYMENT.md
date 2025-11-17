# 🚀 Deploy Backend to Render

## Step 1: Create Render Account

1. Go to: https://render.com/
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended for auto-deploy)

---

## Step 2: Deploy from GitHub

### Option A: Deploy via Dashboard (Easiest)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Add Render configuration"
   git push origin main
   ```

2. **Go to Render Dashboard**: https://dashboard.render.com/
3. Click **"New +"** → **"Web Service"**
4. **Connect your GitHub repository**: `alumni-dashboard`
5. **Configure:**
   - **Name**: `alumni-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

6. Click **"Create Web Service"**

---

## Step 3: Add Environment Variables

After creating the service, go to **Environment** tab and add:

```env
NODE_ENV=production
PORT=8080
SUPABASE_URL=https://vxuvfignecxtqsvhihzn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dXZmaWduZWN4dHFzdmhpaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzA4MTksImV4cCI6MjA3NTY0NjgxOX0.9_nyN1mHS0aTASmJ1kkNZJFd3HGk4KOK5r0TORXpMKo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dXZmaWduZWN4dHFzdmhpaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA3MDgxOSwiZXhwIjoyMDc1NjQ2ODE5fQ.0Ko3iQcn1HYg3dNOVh9VVC2JjHDS6CT3wwxLG9Lpz0w
JWT_SECRET=fewfeffefefwaqfdfgrtdfgertdf
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://frontend-js-chivercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Click **"Save Changes"** - Render will auto-redeploy.

---

## Step 4: Get Your Backend URL

After deployment completes (2-3 minutes):
1. Copy your backend URL (e.g., `https://alumni-backend.onrender.com`)
2. Test health endpoint: `https://alumni-backend.onrender.com/health`

---

## Step 5: Update Frontend

Update Vercel environment variable:
1. Go to: https://vercel.com/tanishsahu1s-projects/frontend-js/settings/environment-variables
2. Edit `NEXT_PUBLIC_API_URL`
3. Set to: `https://alumni-backend.onrender.com/api`
4. Save - Vercel will auto-redeploy

---

## Step 6: Update Supabase

Add Render URL to Supabase redirect URLs:
1. Go to: https://supabase.com/dashboard/project/vxuvfignecxtqsvhihzn/auth/url-configuration
2. Add to **Redirect URLs**: `https://alumni-backend.onrender.com`

---

## Auto-Deployment

✅ **Automatic**: Every push to `main` branch triggers auto-deploy
✅ **Free tier**: 750 hours/month (enough for 24/7 uptime)
✅ **Auto-sleep**: Free tier sleeps after 15 min inactivity (wakes in ~30 seconds)

---

## Monitoring

- **Logs**: https://dashboard.render.com/web/[your-service]/logs
- **Metrics**: https://dashboard.render.com/web/[your-service]/metrics
- **Events**: https://dashboard.render.com/web/[your-service]/events

---

## Troubleshooting

### Build fails
- Check logs in Render dashboard
- Verify `package.json` has correct start script
- Ensure Node version is 18+

### App crashes
- Check environment variables are set
- View logs for error messages
- Verify Supabase credentials

### Slow first request
- Free tier sleeps after inactivity
- First request takes ~30 seconds to wake up
- Upgrade to paid plan for always-on

---

## Free Tier Limits

- ✅ 750 hours/month
- ✅ Auto-sleep after 15 min inactivity
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ⚠️ Slower than paid tiers
- ⚠️ Cold starts after sleep

**Upgrade to Starter ($7/month) for:**
- Always-on (no sleep)
- 512 MB RAM
- 0.5 CPU
- Faster performance
