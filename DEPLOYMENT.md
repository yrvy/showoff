# ShowOff - Deployment Guide

This guide covers deploying ShowOff to various hosting platforms.

## Pre-Deployment Checklist

Before deploying, ensure:

- ✅ Supabase project is set up and working
- ✅ All migrations have been run successfully
- ✅ Storage buckets are created
- ✅ Local development works without errors
- ✅ Environment variables are documented
- ✅ Code is committed to Git repository

## Environment Variables

All platforms will need these environment variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel:**
- Zero configuration
- Automatic HTTPS
- Free tier available
- Excellent performance
- Built-in analytics

**Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite

3. **Configure**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
   - Make sure to add for Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `your-project.vercel.app`

6. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Netlify

**Why Netlify:**
- Easy setup
- Free tier available
- Great for static sites
- Good CI/CD

**Steps:**

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Advanced: Node version: 18

4. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Site will be live at `random-name.netlify.app`

6. **Custom Domain (Optional)**
   - Go to Domain settings
   - Add custom domain
   - Follow DNS instructions

### Option 3: Lovable Cloud

**Why Lovable:**
- Built for Lovable projects
- One-click deploy
- No configuration needed

**Steps:**

1. **Open in Lovable**
   - Import project into Lovable
   - Lovable will detect the configuration

2. **Add Environment Variables**
   - In Lovable settings, add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Deploy**
   - Click "Deploy"
   - Your app will be live instantly

### Option 4: Cloudflare Pages

**Why Cloudflare:**
- Free tier with unlimited bandwidth
- Global CDN
- Fast edge network

**Steps:**

1. **Push to GitHub/GitLab**

2. **Create Cloudflare Pages Project**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com)
   - Click "Create a project"
   - Connect your Git provider
   - Select repository

3. **Configure Build**
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`

4. **Add Environment Variables**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for build
   - Live at `your-project.pages.dev`

### Option 5: Self-Hosted (VPS/Docker)

**For advanced users who want full control**

#### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine as builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t showoff .
   docker run -p 80:80 showoff
   ```

#### Using PM2 (Node.js)

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Install serve**
   ```bash
   npm install -g serve
   ```

3. **Create ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [{
       name: 'showoff',
       script: 'serve',
       args: '-s dist -p 3000',
       env: {
         NODE_ENV: 'production'
       }
     }]
   }
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Post-Deployment Steps

### 1. Test Your Deployment

- ✅ Visit your deployed URL
- ✅ Sign up with a new account
- ✅ Upload an avatar and banner
- ✅ Add peripherals
- ✅ Add game ranks
- ✅ Upload a clip
- ✅ View public profile
- ✅ Test on mobile device

### 2. Configure Supabase for Production

1. **Update Auth Settings**
   - Go to Supabase Dashboard → Authentication → Settings
   - Enable email confirmation
   - Set Site URL to your production URL
   - Add Redirect URLs for your domain

2. **Configure Email Templates** (Optional)
   - Customize confirmation emails
   - Add your branding

3. **Set Up Custom SMTP** (Optional)
   - For better email deliverability
   - Go to Authentication → Settings → SMTP

### 3. Set Up Custom Domain

**DNS Configuration:**

For most providers, add these DNS records:

```
Type: A
Name: @
Value: [Your host's IP]

Type: CNAME
Name: www
Value: your-app.vercel.app (or your host)
```

**SSL Certificate:**
- Most hosts (Vercel, Netlify) auto-provision SSL
- For self-hosted, use Let's Encrypt:
  ```bash
  sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
  ```

### 4. Performance Optimization

**Enable Caching:**
- Add cache headers in your host settings
- Set `Cache-Control` for static assets

**Image Optimization:**
- Consider adding image optimization service
- Supabase has built-in image transformations

**CDN:**
- Most platforms include CDN by default
- For self-hosted, consider Cloudflare

### 5. Monitoring & Analytics

**Recommended Tools:**

- **Vercel Analytics** (if using Vercel)
- **Google Analytics** (add to index.html)
- **Supabase Dashboard** (database metrics)
- **Sentry** (error tracking)

**Add Analytics:**

```html
<!-- In index.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 6. Security Checklist

- ✅ HTTPS is enabled
- ✅ Environment variables are secret
- ✅ Supabase RLS policies are active
- ✅ API keys are not in client code
- ✅ Email confirmation is enabled (production)
- ✅ Rate limiting on Supabase (if needed)

### 7. Backup Strategy

**Database Backups:**
- Supabase auto-backs up daily (Pro plan)
- For Free tier, export regularly:
  ```bash
  supabase db dump > backup.sql
  ```

**Storage Backups:**
- Download from Supabase Storage periodically
- Set up automated backup scripts

## Troubleshooting Deployment

### Build Fails

**Error: "Cannot find module"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

**Error: "TypeScript errors"**
- Check all files for type errors
- Run `npm run build` locally first

### Environment Variables Not Working

**Solution:**
1. Ensure variables start with `VITE_`
2. Restart build after adding variables
3. Clear build cache
4. Check variable names match exactly

### 404 on Refresh

**Problem:** Direct URL navigation causes 404

**Solution:** Configure redirects

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Netlify** - Create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Slow Initial Load

**Solutions:**
- Enable gzip compression
- Implement code splitting
- Lazy load components
- Optimize images

## Scaling Considerations

### When You Grow

**Database:**
- Upgrade Supabase plan for more rows
- Add database indexes for performance
- Consider read replicas

**Storage:**
- Monitor storage usage
- Implement file size limits
- Consider CDN for static assets

**Bandwidth:**
- Most platforms have generous free tiers
- Monitor usage in dashboard
- Implement rate limiting if needed

## Cost Estimates

**Free Tier (Small Projects):**
- Vercel: Free (100GB bandwidth)
- Netlify: Free (100GB bandwidth)
- Supabase: Free (500MB database, 1GB storage)
- **Total: $0/month**

**Paid Tier (Growing Projects):**
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Custom domain: ~$12/year
- **Total: ~$45/month + domain**

## Need Help?

- Check deployment platform docs
- Review Supabase status page
- Check GitHub Issues
- Create detailed bug report

---

**Good luck with your deployment!** 🚀
