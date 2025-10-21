# Quick Deploy to Netlify

## The Fastest Way to Deploy ntropiq

### Option 1: Automated Setup (Recommended)

If you have the Netlify CLI installed, run this:

```bash
# Make the script executable
chmod +x setup-netlify.sh

# Run the setup script
./setup-netlify.sh
```

This script will:
1. Install Netlify CLI if needed
2. Log you into Netlify
3. Read your `.env.local` file
4. Set all environment variables in Netlify
5. Trigger a production deploy

**That's it!** Your site will be live in 2-3 minutes.

---

### Option 2: Manual Setup (5 minutes)

If you prefer to do it manually:

#### Step 1: Add your environment variables to `.env.local`
```bash
cp .env.example .env.local

# Edit .env.local and add your API keys:
# GEMINI_API_KEY=your-actual-key-here
# ELEVENLABS_API_KEY=your-actual-key-here (optional)
```

#### Step 2: Go to Netlify Dashboard
1. Open https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select `InkspireX/ntropiq-ai-platform`

#### Step 3: Set Environment Variables BEFORE deploying
1. Click "Advanced" or go to Site settings → Environment
2. Add these variables:
   - `GEMINI_API_KEY` = (your key from `.env.local`)
   - `ELEVENLABS_API_KEY` = (optional)
   - `ELEVENLABS_VOICE_ID` = `21m00Tcm4TlvDq8ikWAM`
   - `ELEVENLABS_MODEL_ID` = `eleven_multilingual_v2`

#### Step 4: Deploy
- Click "Deploy site"
- Wait 2-3 minutes for the build to complete
- Test your site at the provided URL

---

### Option 3: Deploy Button (One-Click)

If your site is already connected to Netlify with environment variables set, just:

1. Make changes locally
2. Push to GitHub: `git push origin main`
3. Netlify automatically builds and deploys

---

## Troubleshooting

### ❌ "Failed to generate response" error
**Problem**: Environment variables not set in Netlify

**Fix**:
1. Go to Site settings → Environment
2. Verify `GEMINI_API_KEY` is there
3. Click "Redeploy" button

### ❌ Build fails with "npm ERR"
**Problem**: Dependencies issue

**Fix**:
```bash
npm install --legacy-peer-deps
npm run build
```

### ❌ API returns 500 error
**Problem**: Could be missing API key or invalid key

**Fix**:
1. Check browser DevTools (F12) → Console for error message
2. Verify API key is valid in Google AI Studio
3. Redeploy after fixing

---

## Verify Everything Works

Once deployed, test these URLs:

1. **Landing page**: `https://your-site.netlify.app`
2. **Chat interface**: `https://your-site.netlify.app/chat`
3. **Notebook**: `https://your-site.netlify.app/notebook`

Try sending a message in chat to verify the API is working!

---

## Need Help?

- 📖 Full guide: See `NETLIFY_SETUP.md`
- 🔑 API Keys: See `ENVIRONMENT_SETUP.md`
- 📝 Project info: See `WARP.md`
