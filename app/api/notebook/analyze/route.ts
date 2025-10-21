import { NextRequest, NextResponse } from 'next/server'
import { analyzeCode } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { code, language = 'python' } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required and must be a string' },
        { status: 400 }
      )
    }

    const analysis = await analyzeCode(code, language)

    return NextResponse.json({
      analysis,
      language,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Code analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    )
  }
}
