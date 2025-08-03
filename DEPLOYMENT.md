# 🚀 GitHub Pages Deployment Guide

## 📋 Prerequisites

1. ✅ Git repository initialized locally
2. ✅ GitHub account
3. ✅ Project built successfully (`npm run build`)

## 🎯 Step-by-Step Deployment

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `Podcast-Gen` (or update the config files if you use a different name)
3. **Don't** initialize with README, .gitignore, or license (we already have these)

### 2. Connect Local Repository to GitHub

```bash
# In your terminal, from the dashboard directory:
cd "d:\repositories\Podcast Gen\dashboard"

# Add your GitHub repository as origin (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/Podcast-Gen.git

# Push to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The deployment will automatically start

### 4. Update Configuration (Important!)

Before the first deployment, update these files with your GitHub username:

#### Update package.json:
```json
"homepage": "https://YOURUSERNAME.github.io/Podcast-Gen/"
```

#### If you named your repository differently, update vite.config.js:
```javascript
base: command === 'build' ? '/YOUR-REPO-NAME/' : '/',
```

### 5. Commit and Push Changes

```bash
git add .
git commit -m "Update GitHub Pages configuration"
git push origin main
```

### 6. Access Your Deployed App

After successful deployment (check the Actions tab for progress):
- Your app will be available at: `https://yourusername.github.io/Podcast-Gen/`
- The database file will be automatically served from the public folder

## 🔧 Alternative: Manual Deployment

If you prefer manual deployment using gh-pages:

```bash
# Install gh-pages globally (one time only)
npm install -g gh-pages

# Deploy
npm run deploy
```

## 🌟 Features Available in Deployed Version

✅ **Full transcript editing with persistence**
✅ **Database visualization and statistics**
✅ **CSV export and database backup**
✅ **Search, filter, and sort functionality**
✅ **Responsive design for all devices**
✅ **Client-side data persistence using localStorage**

## 🐛 Troubleshooting

### Deployment Fails
- Check the **Actions** tab for error messages
- Ensure Node.js version is compatible (18+)
- Verify all dependencies are in package.json

### App Loads but Database Doesn't
- Check if `flask_app.db` is in the `public` folder
- Verify the database file path in staticDatabase.js
- Check browser console for CORS or loading errors

### Changes Don't Persist
- localStorage works correctly in the deployed version
- Clear browser cache if experiencing issues
- Use "Clear Changes" button to reset all modifications

## 📝 Notes

- The SQLite database runs entirely in the browser using WebAssembly
- No server-side processing - all data stays client-side
- Changes are persisted using localStorage between sessions
- Database backup includes all current modifications

## 🔄 Updating the Deployed App

To update your deployed app:

1. Make changes locally
2. Test with `npm run dev`
3. Build with `npm run build`
4. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
5. GitHub Actions will automatically redeploy

---

**🎉 Your Podcast Transcript Dashboard is now live on GitHub Pages!**
