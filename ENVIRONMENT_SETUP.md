# Environment Setup Guide

## Setting up API Keys

### 1. Create Environment File
Copy the example environment file and add your actual API keys:

```bash
cp .env.example .env
```

### 2. Configure Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key or use an existing one
3. Add your API key to the `.env` file:

```env
GEMINI_API_KEY=your-actual-api-key-here
```

### 3. Security Best Practices

- ✅ Never commit the `.env` file to version control
- ✅ The `.env` file is already in `.gitignore`
- ✅ Keep your API keys secure and private
- ✅ Rotate API keys regularly for security

### 4. Verify Setup

The application will automatically use the API keys from the `.env` file when:
- Generating AI responses in chat
- Processing natural language queries in notebooks
- Analyzing code and providing suggestions

### 5. Environment Variables

| Variable | Description | Required | Where to Get |
|----------|-------------|----------|--------------|
| `GEMINI_API_KEY` | Google Gemini API key for AI responses | **Yes** | [Google AI Studio](https://aistudio.google.com/) |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for text-to-speech | **Yes** | [ElevenLabs](https://elevenlabs.io/) |
| `ELEVENLABS_VOICE_ID` | Voice ID for TTS (default: Rachel) | No | Default: `21m00Tcm4TlvDq8ikWAM` |
| `ELEVENLABS_MODEL_ID` | Model ID for TTS | No | Default: `eleven_multilingual_v2` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js authentication | Optional | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL for authentication | Optional | Your domain URL |

#### Example `.env.local` file:
```bash
# Required API Keys
GEMINI_API_KEY=AIzaSyC_your_actual_gemini_key_here
ELEVENLABS_API_KEY=sk_your_actual_elevenlabs_key_here

# Optional Voice Settings
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

# Optional Authentication
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
```

#### Quick Setup Commands:
```bash
# 1. Create environment file
cp .env.example .env.local

# 2. Edit with your API keys
nano .env.local

# 3. Generate NextAuth secret (optional)
openssl rand -base64 32
```

### 6. Troubleshooting

If you encounter API issues:
1. Verify your API key is correct
2. Check that you have quota remaining
3. Ensure the API key has the necessary permissions
4. Check the console for any error messages

For more information, see the [Google AI Studio documentation](https://ai.google.dev/docs).
