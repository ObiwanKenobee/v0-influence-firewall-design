import { createClient } from '@/lib/supabase/server'

interface URLAnalysisRequest {
  url: string
}

export async function POST(request: Request) {
  try {
    const body: URLAnalysisRequest = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate URL
    let urlObj: URL
    try {
      urlObj = new URL(body.url)
    } catch {
      return Response.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      )
    }

    // Fetch content from URL
    let pageContent = ''
    try {
      const response = await fetch(body.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      })

      if (!response.ok) {
        return Response.json(
          { error: `Failed to fetch URL: ${response.statusText}` },
          { status: 400 }
        )
      }

      const html = await response.text()

      // Extract text content from HTML
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const title = titleMatch ? titleMatch[1].trim() : ''

      // Remove scripts and styles
      let textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Extract meta description
      const descMatch = html.match(
        /<meta\s+name="description"\s+content="([^"]*)"/i
      )
      const description = descMatch ? descMatch[1] : ''

      pageContent = `Title: ${title}\n\nDescription: ${description}\n\nContent: ${textContent.substring(0, 3000)}`
    } catch (fetchError) {
      return Response.json(
        { error: 'Failed to fetch and extract content from URL' },
        { status: 500 }
      )
    }

    // Use the main analyze route to process the extracted content
    const analyzeResponse = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward auth cookie
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          content: pageContent,
          contentType: 'url',
          sourceUrl: body.url,
        }),
      }
    )

    if (!analyzeResponse.ok) {
      return Response.json(
        { error: 'Failed to analyze URL content' },
        { status: 500 }
      )
    }

    const result = await analyzeResponse.json()
    return Response.json(result)
  } catch (error) {
    console.error('[v0] URL analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze URL' },
      { status: 500 }
    )
  }
}
