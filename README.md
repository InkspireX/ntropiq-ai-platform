# 🚀 ntropiq - AI Analytics Platform

A powerful AI-driven analytics platform built with Next.js 15, featuring intelligent chat, interactive notebooks, and voice capabilities for data analysis and machine learning.

![ntropiq](https://img.shields.io/badge/ntropiq-AI%20Analytics-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ Features

### 🤖 AI-Powered Chat
- **Intelligent Conversations**: Chat with AI about your data and analytics
- **Context-Aware Responses**: AI understands your data context and provides relevant insights
- **Voice Integration**: Speak to the AI and get audio responses
- **Real-time Processing**: Instant responses to your queries

### 📊 Interactive Notebook
- **Jupyter-like Experience**: Familiar notebook interface for data analysis
- **Code Execution**: Run Python, SQL, and other data analysis code
- **Visual Outputs**: Charts, graphs, and data visualizations
- **Collaborative**: Share notebooks with your team

### 🗣️ Voice Features
- **Speech-to-Text**: Speak your queries naturally
- **Text-to-Speech**: Listen to AI responses
- **Voice Commands**: Control the interface with voice
- **Multi-language Support**: Works in multiple languages

### 🔗 Data Source Connections
- **Databases**: MySQL, PostgreSQL, MongoDB, SQL Server, Oracle
- **Cloud Storage**: AWS S3, Google Cloud Storage
- **Data Warehouses**: BigQuery, Snowflake, Redshift, Athena
- **APIs**: REST APIs, Salesforce, HubSpot
- **Files**: CSV, JSON, Excel uploads

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI Integration**: Google Gemini AI
- **Voice**: ElevenLabs TTS
- **Deployment**: Netlify-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/InkspireX/ntropiq-ai-platform.git
   cd ntropiq-ai-platform
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys to `.env.local`:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
   ELEVENLABS_MODEL_ID=eleven_multilingual_v2
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Netlify (Recommended)

1. **Automatic Deployment**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables in Netlify dashboard

2. **Manual Deployment**
   ```bash
   ./deploy-to-netlify.sh
   ```
   Then drag the `netlify-deploy` folder to [Netlify Drop](https://app.netlify.com/drop)

### Other Platforms
- **Vercel**: `vercel --prod`
- **Railway**: Connect GitHub repository
- **Render**: Connect GitHub repository

## 📁 Project Structure

```
ntropiq-ai-platform/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # Chat API
│   │   ├── notebook/      # Notebook APIs
│   │   └── voice/         # Voice/TTS API
│   ├── chat/              # Chat interface
│   ├── notebook/           # Notebook interface
│   └── signin/            # Authentication
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── styles/               # Global styles
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS API key | Yes |
| `ELEVENLABS_VOICE_ID` | Voice ID for TTS | No |
| `ELEVENLABS_MODEL_ID` | Model ID for TTS | No |

### API Keys Setup

1. **Gemini AI**: Get your API key from [Google AI Studio](https://aistudio.google.com/)
2. **ElevenLabs**: Get your API key from [ElevenLabs](https://elevenlabs.io/)

## 🎯 Usage

### Chat Interface
- Ask questions about your data
- Get AI-powered insights
- Use voice commands
- Export conversations

### Notebook Environment
- Write and execute code
- Create visualizations
- Analyze data interactively
- Share notebooks

### Data Connections
- Connect to databases
- Upload files
- Configure API endpoints
- Set up data pipelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [ElevenLabs](https://elevenlabs.io/) - Voice synthesis
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📞 Support

- 📧 Email: support@ntropiq.com
- 🐛 Issues: [GitHub Issues](https://github.com/InkspireX/ntropiq-ai-platform/issues)
- 📖 Documentation: [Wiki](https://github.com/InkspireX/ntropiq-ai-platform/wiki)

---

**Built with ❤️ for the data analytics community**
