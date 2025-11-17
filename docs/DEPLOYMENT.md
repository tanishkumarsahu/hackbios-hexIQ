# 🚀 Deployment Guide

## Deployed URLs

- **Frontend (Vercel):** https://frontend-js-chivercel.app
- **Backend (Railway):** https://alumni-backend-production-31ac.up.railway.app

---

## Environment Variables Setup

### Railway Backend

Go to: https://railway.com/project/8316e32b-c88d-4a24-b144-e9d3dea5d2e3

**Variables → Raw Editor → Paste:**

```env
PORT=8080
NODE_ENV=production
SUPABASE_URL=https://vxuvfignecxtqsvhihzn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dXZmaWduZWN4dHFzdmhpaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzA4MTksImV4cCI6MjA3NTY0NjgxOX0.9_nyN1mHS0aTASmJ1kkNZJFd3HGk4KOK5r0TORXpMKo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dXZmaWduZWN4dHFzdmhpaHpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA3MDgxOSwiZXhwIjoyMDc1NjQ2ODE5fQ.0Ko3iQcn1HYg3dNOVh9VVC2JjHDS6CT3wwxLG9Lpz0w
JWT_SECRET=fewfeffefefwaqfdfgrtdfgertdf
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://frontend-js-chivercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

### Vercel Frontend

Go to: https://vercel.com/tanishsahu1s-projects/frontend-js/settings/environment-variables

**Add these variables:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://vxuvfignecxtqsvhihzn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dXZmaWduZWN4dHFzdmhpaHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzA4MTksImV4cCI6MjA3NTY0NjgxOX0.9_nyN1mHS0aTASmJ1kkNZJFd3HGk4KOK5r0TORXpMKo
NEXT_PUBLIC_SITE_URL=https://frontend-js-chivercel.app
NEXT_PUBLIC_API_URL=https://alumni-backend-production-31ac.up.railway.app/api
```

**Important:** Make sure to select **Production**, **Preview**, and **Development** for each variable.

---

## Auto-Deployment

Both platforms are configured for auto-deployment:

- **Vercel:** Auto-deploys on every push to `main` branch
- **Railway:** Auto-deploys on every push to `main` branch

---

## Manual Deployment Commands

### Backend (Railway)
```bash
cd backend
railway up --detach
```

### Frontend (Vercel)
```bash
cd frontend_js
vercel --prod
```

---

## Testing the Deployment

1. **Backend Health Check:**
   ```
   https://alumni-backend-production-31ac.up.railway.app/health
   ```

2. **Frontend:**
   ```
   https://frontend-js-chivercel.app
   ```

3. **Test Login/Register:**
   - Go to frontend URL
   - Try registering a new account
   - Check if API calls work

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Railway matches your Vercel domain exactly
- Check Railway logs: `railway logs`

### API Not Found (404)
- Verify `NEXT_PUBLIC_API_URL` includes `/api` at the end
- Check Railway deployment logs

### Environment Variables Not Working
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

---

## Monitoring

- **Railway Logs:** `railway logs` or check dashboard
- **Vercel Logs:** Check deployment logs in Vercel dashboard
- **Supabase:** Monitor database queries in Supabase dashboard

---

## 🎯 Phase 1 Production Checklist

### ✅ Pre-Deployment Checklist

**Database:**
- [x] All migrations applied via Supabase CLI
- [x] RLS policies enabled on all tables
- [x] Storage bucket created with policies
- [x] Indexes created for performance

**Frontend:**
- [x] Environment variables configured
- [x] Image domains whitelisted (Google, Supabase)
- [x] Error boundaries added
- [x] Loading states implemented
- [x] Production build tested locally

**Features:**
- [x] Profile picture upload
- [x] Job applications with cover letter
- [x] Event registration/cancellation
- [x] Notifications system with real-time updates

### 📦 Build & Deploy

```bash
# 1. Test production build locally
cd frontend_js
npm run build
npm run start

# 2. Deploy to Vercel
vercel --prod

# 3. Verify deployment
# - Test all Phase 1 features
# - Check browser console for errors
# - Test on mobile devices
```

### 🔒 Security Checklist

- [x] API keys in environment variables (not hardcoded)
- [x] RLS policies prevent unauthorized access
- [x] File upload size limits (5MB)
- [x] Image type validation
- [x] SQL injection prevention (Supabase handles this)
- [x] XSS protection (React escapes by default)

### ⚡ Performance Checklist

- [x] Images optimized with Next.js Image component
- [x] Code splitting (Next.js automatic)
- [x] Lazy loading for heavy components
- [x] Database indexes on frequently queried columns
- [x] Caching for static assets

### 📱 Mobile Checklist

- [x] Responsive design tested
- [x] Touch targets ≥44px
- [x] Forms work on mobile keyboards
- [x] Modals scroll properly
- [x] Images load on mobile networks

---

## 🚀 Deployment Steps

### Step 1: Final Code Review
```bash
# Run linter
npm run lint

# Fix any issues
npm run lint:fix
```

### Step 2: Test Build
```bash
# Clean previous builds
npm run clean

# Create production build
npm run build

# Test locally
npm run start
```

### Step 3: Deploy to Vercel
```bash
# Deploy to production
vercel --prod

# Or push to main branch for auto-deploy
git add .
git commit -m "Phase 1: Production ready"
git push origin main
```

### Step 4: Verify Deployment
1. Visit deployed URL
2. Test user registration/login
3. Upload profile picture
4. Apply to a job
5. Register for an event
6. Check notifications

### Step 5: Monitor
- Check Vercel deployment logs
- Monitor Supabase dashboard for errors
- Test on different devices/browsers

---

## 🐛 Common Issues & Fixes

### Issue: Images not loading
**Fix:** Verify `next.config.js` has correct image domains

### Issue: API calls failing
**Fix:** Check CORS settings and environment variables

### Issue: Notifications not real-time
**Fix:** Verify Supabase real-time is enabled for notifications table

### Issue: File upload fails
**Fix:** Check storage bucket policies and size limits

---

## 📊 Post-Deployment Monitoring

### Metrics to Track:
- Page load times (< 3s)
- API response times (< 500ms)
- Error rates (< 1%)
- User engagement (registrations, applications)

### Tools:
- Vercel Analytics
- Supabase Dashboard
- Browser DevTools
- Lighthouse scores

---

## 🎉 Phase 1 Complete!

All features are production-ready and deployed. Users can now:
- ✅ Upload profile pictures
- ✅ Apply to jobs with cover letters
- ✅ Register for events
- ✅ Receive real-time notifications
