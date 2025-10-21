#!/bin/bash

# Netlify Environment Setup Script
# This script helps set up environment variables for Netlify deployment

set -e

echo "🚀 ntropiq Netlify Setup"
echo "========================"
echo ""

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if user is logged in
if ! netlify status &> /dev/null; then
    echo "🔐 Logging in to Netlify..."
    netlify login
fi

echo ""
echo "📋 Reading environment variables from .env.local..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your API keys:"
    echo "  cp .env.example .env.local"
    echo "  # Then edit .env.local with your API keys"
    exit 1
fi

# Load environment variables from .env.local
export $(cat .env.local | grep -v '^#' | xargs)

# Get the site ID (or let user select)
echo "🔍 Finding your site..."
SITE_ID=$(netlify list | grep ntropiq | head -1 | awk '{print $NF}')

if [ -z "$SITE_ID" ]; then
    echo "No site found. Setting up new site..."
    netlify sites:create --name ntropiq-ai-platform
    SITE_ID=$(netlify list | grep ntropiq | head -1 | awk '{print $NF}')
fi

echo "✅ Found site: $SITE_ID"
echo ""

# Set environment variables
echo "🔧 Setting environment variables..."

if [ -n "$GEMINI_API_KEY" ]; then
    echo "Setting GEMINI_API_KEY..."
    netlify env:set GEMINI_API_KEY "$GEMINI_API_KEY" --scope=builds
fi

if [ -n "$ELEVENLABS_API_KEY" ]; then
    echo "Setting ELEVENLABS_API_KEY..."
    netlify env:set ELEVENLABS_API_KEY "$ELEVENLABS_API_KEY" --scope=builds
fi

if [ -n "$ELEVENLABS_VOICE_ID" ]; then
    echo "Setting ELEVENLABS_VOICE_ID..."
    netlify env:set ELEVENLABS_VOICE_ID "$ELEVENLABS_VOICE_ID" --scope=builds
fi

if [ -n "$ELEVENLABS_MODEL_ID" ]; then
    echo "Setting ELEVENLABS_MODEL_ID..."
    netlify env:set ELEVENLABS_MODEL_ID "$ELEVENLABS_MODEL_ID" --scope=builds
fi

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "📤 Triggering a new deploy..."
netlify deploy --prod --build

echo ""
echo "🎉 Deployment complete!"
echo "Your site should now have working APIs."
