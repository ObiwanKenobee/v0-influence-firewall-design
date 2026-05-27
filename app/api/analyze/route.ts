import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

interface AnalysisRequest {
  content: string
  contentType: 'text' | 'url' | 'document'
  sourceUrl?: string
}

interface AnalysisResponse {
  contentId: string
  toxicityScore: number
  toxicityDetails: string
  misinformationScore: number
  misinformationDetails: string
  manipulationScore: number
  manipulationDetails: string
  valuesAlignmentScore: number
  valuesAlignmentDetails: string
  overallRiskScore: number
  riskLevel: string
}

const openai = createOpenAI()

export async function POST(request: Request) {
  try {
    const body: AnalysisRequest = await request.json()
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Store analyzed content
    const { data: contentData, error: contentError } = await supabase
      .from('analyzed_content')
      .insert({
        user_id: user.id,
        content_text: body.content,
        content_type: body.contentType,
        source_url: body.sourceUrl,
      })
      .select()
      .single()

    if (contentError) {
      return Response.json(
        { error: 'Failed to store content' },
        { status: 500 }
      )
    }

    // Analyze toxicity
    const toxicityResponse = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Analyze the following content for toxicity, hate speech, and harmful language. Rate on a scale of 0-100 where 0 is completely non-toxic and 100 is extremely toxic. Provide a JSON response with this exact format:
{
  "score": <number>,
  "details": "<explanation>"
}

Content to analyze:
"${body.content.substring(0, 1000)}"`,
      temperature: 0.3,
    })

    let toxicityData = { score: 0, details: 'Unable to analyze' }
    try {
      const toxicityJson = toxicityResponse.text.match(/\{[\s\S]*\}/)
      if (toxicityJson) {
        toxicityData = JSON.parse(toxicityJson[0])
      }
    } catch {
      console.error('[v0] Failed to parse toxicity response')
    }

    // Analyze misinformation
    const misinformationResponse = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Analyze the following content for misinformation, false claims, and misleading statements. Rate on a scale of 0-100 where 0 means completely factual and 100 means completely false or misleading. Provide a JSON response with this exact format:
{
  "score": <number>,
  "details": "<explanation>"
}

Content to analyze:
"${body.content.substring(0, 1000)}"`,
      temperature: 0.3,
    })

    let misinformationData = { score: 0, details: 'Unable to analyze' }
    try {
      const misinformationJson = misinformationResponse.text.match(/\{[\s\S]*\}/)
      if (misinformationJson) {
        misinformationData = JSON.parse(misinformationJson[0])
      }
    } catch {
      console.error('[v0] Failed to parse misinformation response')
    }

    // Analyze manipulation patterns
    const manipulationResponse = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Analyze the following content for manipulation tactics, dark patterns, emotional manipulation, and persuasion tactics designed to exploit human psychology. Rate on a scale of 0-100 where 0 means no manipulation and 100 means extremely manipulative. Provide a JSON response with this exact format:
{
  "score": <number>,
  "details": "<explanation>"
}

Content to analyze:
"${body.content.substring(0, 1000)}"`,
      temperature: 0.3,
    })

    let manipulationData = { score: 0, details: 'Unable to analyze' }
    try {
      const manipulationJson = manipulationResponse.text.match(/\{[\s\S]*\}/)
      if (manipulationJson) {
        manipulationData = JSON.parse(manipulationJson[0])
      }
    } catch {
      console.error('[v0] Failed to parse manipulation response')
    }

    // Analyze values alignment (neutral baseline)
    const valuesAlignmentResponse = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Analyze the following content's alignment with universal values of human dignity, truthfulness, autonomy, and wellbeing. Rate on a scale of 0-100 where 0 means completely violates these values and 100 means strongly aligns with these values. Provide a JSON response with this exact format:
{
  "score": <number>,
  "details": "<explanation>"
}

Content to analyze:
"${body.content.substring(0, 1000)}"`,
      temperature: 0.3,
    })

    let valuesAlignmentData = { score: 50, details: 'Unable to analyze' }
    try {
      const valuesAlignmentJson = valuesAlignmentResponse.text.match(
        /\{[\s\S]*\}/
      )
      if (valuesAlignmentJson) {
        valuesAlignmentData = JSON.parse(valuesAlignmentJson[0])
      }
    } catch {
      console.error('[v0] Failed to parse values alignment response')
    }

    // Store analysis results
    const { data: resultData, error: resultError } = await supabase
      .from('analysis_results')
      .insert({
        content_id: contentData.id,
        user_id: user.id,
        toxicity_score: Math.min(100, Math.max(0, toxicityData.score)),
        toxicity_details: toxicityData.details,
        misinformation_score: Math.min(
          100,
          Math.max(0, misinformationData.score)
        ),
        misinformation_details: misinformationData.details,
        manipulation_score: Math.min(100, Math.max(0, manipulationData.score)),
        manipulation_details: manipulationData.details,
        values_alignment_score: Math.min(
          100,
          Math.max(0, valuesAlignmentData.score)
        ),
        values_alignment_details: valuesAlignmentData.details,
      })
      .select()
      .single()

    if (resultError) {
      return Response.json(
        { error: 'Failed to store analysis results' },
        { status: 500 }
      )
    }

    const response: AnalysisResponse = {
      contentId: contentData.id,
      toxicityScore: resultData.toxicity_score,
      toxicityDetails: resultData.toxicity_details,
      misinformationScore: resultData.misinformation_score,
      misinformationDetails: resultData.misinformation_details,
      manipulationScore: resultData.manipulation_score,
      manipulationDetails: resultData.manipulation_details,
      valuesAlignmentScore: resultData.values_alignment_score,
      valuesAlignmentDetails: resultData.values_alignment_details,
      overallRiskScore: resultData.overall_risk_score,
      riskLevel: resultData.risk_level,
    }

    return Response.json(response)
  } catch (error) {
    console.error('[v0] Analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}
