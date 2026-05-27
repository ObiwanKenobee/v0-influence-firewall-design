import { createClient } from '@/lib/supabase/server'
import pdfParse from 'pdf-parse'

interface DocumentAnalysisRequest {
  fileName: string
  fileContent: string // base64 encoded
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let extractedText = ''

    // Handle PDF files
    if (file.type === 'application/pdf') {
      try {
        const buffer = await file.arrayBuffer()
        const pdfData = await pdfParse(buffer)
        extractedText = pdfData.text.substring(0, 5000)
      } catch (pdfError) {
        console.error('[v0] PDF parsing error:', pdfError)
        return Response.json(
          { error: 'Failed to parse PDF file' },
          { status: 400 }
        )
      }
    } else if (file.type.startsWith('text/') || file.type === 'application/json') {
      // Handle text files
      try {
        extractedText = await file.text()
        extractedText = extractedText.substring(0, 5000)
      } catch (textError) {
        console.error('[v0] Text file reading error:', textError)
        return Response.json(
          { error: 'Failed to read text file' },
          { status: 400 }
        )
      }
    } else {
      return Response.json(
        { error: 'Unsupported file type. Please use PDF or text files.' },
        { status: 400 }
      )
    }

    if (!extractedText.trim()) {
      return Response.json(
        { error: 'No readable content found in document' },
        { status: 400 }
      )
    }

    // Use the main analyze route to process the extracted content
    const analyzeResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          content: extractedText,
          contentType: 'document',
          sourceUrl: file.name,
        }),
      }
    )

    if (!analyzeResponse.ok) {
      return Response.json(
        { error: 'Failed to analyze document content' },
        { status: 500 }
      )
    }

    const result = await analyzeResponse.json()
    return Response.json(result)
  } catch (error) {
    console.error('[v0] Document analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze document' },
      { status: 500 }
    )
  }
}
