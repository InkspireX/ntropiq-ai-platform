#!/bin/bash

# Deploy to Netlify using drag-and-drop method
echo "🚀 Preparing deployment package..."

# Build the application
echo "📦 Building application..."
npm run build

# Create deployment directory
mkdir -p netlify-deploy
cp -r .next netlify-deploy/
cp package.json netlify-deploy/
cp package-lock.json netlify-deploy/
cp netlify.toml netlify-deploy/
cp -r public netlify-deploy/ 2>/dev/null || true

# Create a simple index.html redirect for SPA
cat > netlify-deploy/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ntropiq - AI Analytics Platform</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
        // Redirect to the Next.js app
        window.location.href = '/';
    </script>
</head>
<body>
    <p>Redirecting to ntropiq...</p>
</body>
</html>
EOF

echo "✅ Deployment package ready in 'netlify-deploy' folder"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://app.netlify.com/drop"
echo "2. Drag the 'netlify-deploy' folder to the drop zone"
echo "3. Wait for deployment to complete"
echo "4. Environment variables are already configured in netlify.toml:"
echo "   - GEMINI_API_KEY (already set)"
echo "   - ELEVENLABS_API_KEY (optional - add in Netlify dashboard if needed)"
echo "   - ELEVENLABS_VOICE_ID (optional)"
echo "   - ELEVENLABS_MODEL_ID (optional)"
echo ""
echo "🌐 Your site will be available at: https://[random-name].netlify.app"
