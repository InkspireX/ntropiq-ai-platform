import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini API with proper error handling
const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is not set')
    throw new Error('Gemini API key is not configured')
  }
  
  console.log('Initializing Gemini with API key:', apiKey.substring(0, 10) + '...')
  return new GoogleGenerativeAI(apiKey)
}

let genAI: GoogleGenerativeAI | null = null

// Lazy initialization to avoid build-time errors
const getGeminiInstance = () => {
  if (!genAI) {
    try {
      genAI = initializeGemini()
    } catch (error) {
      console.error('Failed to initialize Gemini:', error)
      return null
    }
  }
  return genAI
}

// Get the Gemini model
export const getGeminiModel = () => {
  const instance = getGeminiInstance()
  if (!instance) {
    throw new Error('Gemini AI is not properly initialized')
  }
  return instance.getGenerativeModel({ model: 'gemini-1.5-flash' }) // Use the more reliable model
}

// Function to generate AI responses for chat
export async function generateChatResponse(message: string): Promise<string> {
  try {
    console.log('Generating chat response for message:', message.substring(0, 50) + '...')
    const model = getGeminiModel()
    
    // Determine response style based on message type
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)!?$/i.test(message.trim())
    const isSimpleQuery = message.trim().length < 20 && !/\b(analyze|model|data|ML|machine learning|analytics|visualization|dashboard|SQL|python|statistics|correlation|regression|prediction)\b/i.test(message)
    
    let prompt: string
    
    if (isGreeting) {
      prompt = `You are ntropiq AI, a friendly data analytics assistant. The user just greeted you with: "${message}"

Respond with a brief, warm greeting and let them know you can help with data analytics, machine learning, and insights. Keep it conversational and under 2 sentences.`
    } else if (isSimpleQuery) {
      prompt = `You are ntropiq AI, a data analytics assistant. The user asked: "${message}"

Provide a brief, helpful response in 1-2 sentences. If it's not related to data analytics, gently redirect them to how you can help with data analysis, ML models, or insights.`
    } else {
      prompt = `You are ntropiq AI, an advanced analytics and machine learning assistant. You help users with data analysis, insights, and building ML models through natural language.

User message: ${message}

Provide a helpful, professional response. For technical questions, be detailed and actionable. Format your response in clean, readable text (not code blocks unless showing actual code). Use bullet points or numbered lists when helpful for clarity.`
    }

    console.log('Calling Gemini API...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('Gemini response received, length:', text.length)
    return text
  } catch (error) {
    console.error('Error generating chat response:', error)
    console.error('Error details:', error.message, error.stack)
    throw error // Re-throw to let the API route handle it
  }
}

// Function to generate insights for natural language queries in notebook
export async function generateNotebookInsights(query: string): Promise<string> {
  try {
    console.log('Generating notebook insights for query:', query.substring(0, 50) + '...')
    const model = getGeminiModel()
    
    // Check if query is extremely vague and truly needs clarification
    const isVagueQuery = query.trim().length < 10 || 
      /^(help|what|how)$|^(data|analysis|model)$/i.test(query.trim())
    
    let prompt: string
    
    if (isVagueQuery) {
      prompt = `You are ntropiq AI in a notebook environment. The user entered: "${query}"

This query is too vague. Respond with:
1. A brief acknowledgment (1 sentence)
2. 2-3 specific clarifying questions to help them be more precise

Keep it concise and focused on getting the information needed to provide better analysis.`
    } else {
      prompt = `You are ntropiq AI in a notebook environment. The user wants: "${query}"

Provide a direct, concise response with:
1. A brief answer or insight (2-3 sentences max)
2. Key next steps or recommendations (bullet points)

Be concise and actionable. Do NOT ask clarifying questions unless the query is completely impossible to address without critical missing information. Focus on providing useful insights and next steps.`
    }

    console.log('Calling Gemini API for notebook insights...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('Notebook insights response received, length:', text.length)
    return text
  } catch (error) {
    console.error('Error generating notebook insights:', error)
    console.error('Error details:', error.message, error.stack)
    throw error // Re-throw to let the API route handle it
  }
}

// Function to analyze and suggest code improvements
export async function analyzeCode(code: string, language: string = 'python'): Promise<string> {
  try {
    const model = getGeminiModel()
    
    const prompt = `You are ntropiq AI in a notebook environment. Analyze this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide a concise response with:
1. What the code does (1-2 sentences)
2. Key observations or issues (bullet points)
3. One specific improvement suggestion if applicable

Be brief and notebook-appropriate. No long explanations.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    return text
  } catch (error) {
    console.error('Error analyzing code:', error)
    return `**Code Analysis Error**

Unable to analyze the code. Please check for syntax errors and try again.

**Quick checks:**
• Proper indentation
• Closed parentheses and quotes
• Valid ${language} syntax`
  }
}
