# Deployment Guide

This guide covers deploying the Birzeit Lab Scheduler to various platforms.

## Prerequisites

- Git repository with the code
- Node.js 18+ installed locally
- Account on your chosen platform (GitHub, Netlify, Vercel, or Cloudflare)

## Option 1: GitHub Pages (Recommended)

### Setup

1. **Update Configuration**

Edit `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/birzeit-lab-scheduler/', // Your repo name
  // ...
});
```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

3. **Push to Main Branch**
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

4. **GitHub Actions will automatically**:
   - Install dependencies
   - Build the project
   - Deploy to `gh-pages` branch
   - Your site will be live at: `https://yourusername.github.io/birzeit-lab-scheduler/`

### Manual Deployment

Alternatively, deploy manually:
```bash
npm run build
npm run deploy
```

## Option 2: Netlify

### Automatic Deployment

1. **Connect Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

3. **Configure Functions** (for proxy)
   - Functions directory is auto-detected from `netlify.toml`
   - The proxy will be available at `/.netlify/functions/proxy`

### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Environment Variables

If needed, add in Netlify dashboard:
- Site settings → Environment variables
- Add any required variables

## Option 3: Vercel

### Automatic Deployment

1. **Import Project**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**
   - Click "Deploy"
   - Your site will be live at: `https://your-project.vercel.app`

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Serverless Functions

The proxy function is configured in `vercel.json` and will be available at `/api/proxy`.

## Option 4: Cloudflare Pages + Workers

### Deploy Pages

1. **Connect Repository**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com)
   - Click "Create a project"
   - Connect to GitHub

2. **Configure Build**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Click "Save and Deploy"

### Deploy Worker (Proxy)

1. **Install Wrangler**
```bash
npm install -g wrangler
```

2. **Login**
```bash
wrangler login
```

3. **Configure Worker**

Edit `wrangler.toml`:
```toml
name = "birzeit-scheduler-proxy"
main = "api/proxy.js"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "your-domain.com/api/proxy", zone_name = "your-domain.com" }
]
```

4. **Deploy Worker**
```bash
wrangler deploy
```

5. **Update App Configuration**

In `src/store/useStore.ts`, update the proxy URL:
```typescript
const proxyUrl = `https://your-worker.workers.dev?url=${encodeURIComponent(targetUrl)}`;
```

## Proxy Endpoint Setup

The proxy is needed to bypass CORS when fetching from Ritaj. Choose one option:

### Option A: Use Platform's Serverless Functions

**Netlify/Vercel**: The proxy is automatically deployed as a serverless function.

Update `src/store/useStore.ts`:
```typescript
// For Netlify
const proxyUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(targetUrl)}`;

// For Vercel
const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
```

### Option B: Deploy Separate Cloudflare Worker

1. Deploy worker as shown above
2. Update app to use worker URL
3. Configure CORS headers in worker

### Option C: No Proxy (Manual Upload Only)

If you can't deploy a proxy:
1. Remove proxy fetch attempt in `useStore.ts`
2. Users must manually download and upload HTML files
3. Add instructions in the UI

## Custom Domain

### GitHub Pages

1. Add `CNAME` file to `public/` directory:
```
yourdomain.com
```

2. Configure DNS:
   - Add A records pointing to GitHub's IPs
   - Or CNAME record pointing to `yourusername.github.io`

3. Enable HTTPS in repository settings

### Netlify

1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions
4. SSL is automatic

### Vercel

1. Go to Project settings → Domains
2. Add your domain
3. Configure DNS as instructed
4. SSL is automatic

### Cloudflare Pages

1. Go to Custom domains
2. Add your domain
3. DNS is automatically configured if domain is on Cloudflare
4. SSL is automatic

## Environment Variables

If you need environment variables:

### GitHub Actions

Add secrets in repository settings:
```yaml
# .github/workflows/deploy.yml
env:
  VITE_API_URL: ${{ secrets.API_URL }}
```

### Netlify

```bash
netlify env:set VITE_API_URL "https://api.example.com"
```

### Vercel

```bash
vercel env add VITE_API_URL
```

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All assets load (check browser console)
- [ ] Data fetching works (or upload works)
- [ ] Scheduling algorithm runs
- [ ] Export/Import functions work
- [ ] Service Worker registers (check DevTools → Application)
- [ ] IndexedDB persistence works
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)

## Monitoring

### GitHub Pages

- Check Actions tab for deployment status
- View deployment logs for errors

### Netlify

- Dashboard shows deployment status
- View function logs for proxy errors
- Set up notifications for failed deployments

### Vercel

- Dashboard shows deployment status
- View function logs in real-time
- Set up Slack/email notifications

### Cloudflare

- Pages dashboard for build status
- Workers dashboard for proxy analytics
- Set up alerts for errors

## Rollback

### GitHub Pages

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Netlify/Vercel

- Use dashboard to rollback to previous deployment
- Or redeploy a specific commit

## Troubleshooting

### Build Fails

1. Check Node version matches (18+)
2. Clear `node_modules` and reinstall
3. Check for TypeScript errors
4. Review build logs

### Proxy Not Working

1. Verify function is deployed
2. Check function logs for errors
3. Test proxy endpoint directly
4. Verify CORS headers

### Assets Not Loading

1. Check `base` in `vite.config.ts`
2. Verify all paths are relative
3. Check browser console for 404s

### Service Worker Issues

1. Clear browser cache
2. Unregister old service workers
3. Check DevTools → Application → Service Workers
4. Verify manifest.json loads

## Performance Optimization

### Enable Compression

Most platforms enable gzip/brotli automatically.

### CDN Configuration

- GitHub Pages: Uses GitHub's CDN
- Netlify/Vercel: Global CDN included
- Cloudflare: Automatic CDN

### Caching Headers

Configured in `vite.config.ts` and platform settings.

## Security

### HTTPS

All platforms provide free SSL certificates.

### Content Security Policy

Add to `index.html` if needed:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; ...">
```

### Rate Limiting

Configure in proxy function to prevent abuse.

## Maintenance

### Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor error rates
- Check analytics for usage patterns

## Support

For deployment issues:
- Check platform documentation
- Review deployment logs
- Open an issue on GitHub
- Contact platform support

---

**Happy Deploying! 🚀**
