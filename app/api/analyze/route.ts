import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { analysisPrompts, extractJsonFromResponse, ensureScoreBounds } from '@/lib/llm-prompts'

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
      prompt: analysisPrompts.toxicity(body.content),
      temperature: 0.3,
    })

    let toxicityData = { score: 0, details: 'Unable to analyze' }
    const parsedToxicity = extractJsonFromResponse(toxicityResponse.text)
    if (parsedToxicity) {
      toxicityData = parsedToxicity
    }

    // Analyze misinformation
    const misinformationResponse = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: analysisPrompts.misinformation(body.content),
      temperature: 0.3,
    })

    let misinformationData = { score: 0, details: 'Unable to analyze' }
    const parsedMisinformation = extractJsonFromResponse(misinformationResponse.text)
    if (parsedMisinformation) {
      misinformationData = parsedMisinformation
    }

    // Analyze manipulation patterns
    const manipulationResponse = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: analysisPrompts.manipulation(body.content),
      temperature: 0.3,
    })

    let manipulationData = { score: 0, details: 'Unable to analyze' }
    const parsedManipulation = extractJsonFromResponse(manipulationResponse.text)
    if (parsedManipulation) {
      manipulationData = parsedManipulation
    }

    // Analyze values alignment (neutral baseline)
    const valuesAlignmentResponse = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: analysisPrompts.valuesAlignment(body.content),
      temperature: 0.3,
    })

    let valuesAlignmentData = { score: 50, details: 'Unable to analyze' }
    const parsedValuesAlignment = extractJsonFromResponse(valuesAlignmentResponse.text)
    if (parsedValuesAlignment) {
      valuesAlignmentData = parsedValuesAlignment
    }

    // Store analysis results
    const { data: resultData, error: resultError } = await supabase
      .from('analysis_results')
      .insert({
        content_id: contentData.id,
        user_id: user.id,
        toxicity_score: ensureScoreBounds(toxicityData.score),
        toxicity_details: toxicityData.details,
        misinformation_score: ensureScoreBounds(misinformationData.score),
        misinformation_details: misinformationData.details,
        manipulation_score: ensureScoreBounds(manipulationData.score),
        manipulation_details: manipulationData.details,
        values_alignment_score: ensureScoreBounds(valuesAlignmentData.score),
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
