import { NextRequest, NextResponse } from 'next/server'
import { generateNotebookInsights } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    const insights = await generateNotebookInsights(query)

    return NextResponse.json({
      insights,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Notebook insights API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
