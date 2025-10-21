# Netlify Deployment Guide

This guide walks you through deploying ntropiq to Netlify with proper environment variable configuration.

## Prerequisites

- GitHub account with the ntropiq repository
- Netlify account (sign up at https://netlify.com if you don't have one)
- API keys for:
  - Google Gemini (https://aistudio.google.com/app/apikey)
  - ElevenLabs (https://elevenlabs.io/) - optional for voice features

## Step-by-Step Deployment

### 1. Connect GitHub Repository to Netlify

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authorize Netlify to access your repositories
4. Search for and select **`InkspireX/ntropiq-ai-platform`**

### 2. Configure Build Settings

Netlify should auto-detect the following settings, but verify they match:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18

Leave all other settings as default.

### 3. Set Environment Variables (CRITICAL)

**Before deploying, you MUST set environment variables in Netlify:**

1. Click **"Advanced"** before deploying (or go to Site settings → Environment)
2. Click **"New variable"** and add:

| Variable | Value | Required |
|----------|-------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | ✅ Yes |
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key | ❌ Optional |
| `ELEVENLABS_VOICE_ID` | `21m00Tcm4TlvDq8ikWAM` | ❌ Optional |
| `ELEVENLABS_MODEL_ID` | `eleven_multilingual_v2` | ❌ Optional |

**How to get API keys:**

#### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"** (select project if prompted)
3. Copy the API key and paste it in Netlify

#### ElevenLabs API Key (for voice features)
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in
3. Go to Account → API Keys
4. Copy your API key and paste it in Netlify

### 4. Deploy

1. After setting all environment variables, click **"Deploy site"**
2. Netlify will start building and deploying automatically
3. Wait for the build to complete (usually 2-3 minutes)

### 5. Verify Deployment

1. Once deployed, you'll see your live URL (e.g., `https://your-site.netlify.app`)
2. Open the URL in your browser
3. Test the API by:
   - Going to `/chat` and sending a message
   - Going to `/notebook` and running a natural language query

## Troubleshooting

### API Returns "Failed to generate response"

**Cause**: Environment variables are not set in Netlify

**Solution**:
1. Go to Netlify Site settings → Environment
2. Verify `GEMINI_API_KEY` is set correctly
3. Click the **"Redeploy"** button to rebuild with the new variables

### Chat/Notebook Returns 500 Error

1. Open browser DevTools (F12)
2. Go to Console tab
3. Check the error message
4. Common issues:
   - Missing API keys → Set environment variables
   - API key invalid → Verify the key is correct
   - Model not available → Check that `gemini-2.0-flash` is valid

### Environment Variables Not Taking Effect

1. Set the variables in Netlify Site settings
2. Click the **"Redeploy"** button (not just wait for auto-deploy)
3. Wait 2-3 minutes for the rebuild

## Continuous Deployment

Once set up, Netlify will automatically:
- Rebuild and redeploy whenever you push to the `main` branch
- Run the build process using the command in netlify.toml
- Use the environment variables you configured

## Production Checklist

- ✅ Environment variables set in Netlify (GEMINI_API_KEY required)
- ✅ Build completes successfully without errors
- ✅ Chat API (`/api/chat`) responds with AI messages
- ✅ Notebook API (`/api/notebook/insights`) generates insights
- ✅ All pages load without errors

## Security Notes

- **Never commit .env files to GitHub** - they're in `.gitignore`
- **Environment variables are only stored in Netlify** - not in the code
- Keep API keys confidential and rotate them periodically
- Use different API keys for development and production if possible
