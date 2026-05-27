export const analysisPrompts = {
  toxicity: (content: string) => `You are an expert at analyzing content for toxicity, hate speech, and harmful language.

Analyze the following content for toxicity. Consider:
- Direct attacks and insults
- Hate speech targeting protected groups
- Threats and violent language
- Dehumanizing language
- Harassment and bullying

Rate on a scale of 0-100 where:
- 0-20: No toxic language detected
- 21-40: Mild toxic elements
- 41-60: Moderate toxic content
- 61-80: Severe toxic language
- 81-100: Extremely toxic or hateful content

Provide a JSON response with this exact format:
{
  "score": <number>,
  "details": "<specific findings and reasoning>"
}

Content to analyze:
"${content.substring(0, 1000)}"`,

  misinformation: (content: string) => `You are an expert fact-checker analyzing content for misinformation.

Analyze the following content for misinformation, false claims, and misleading statements. Consider:
- Verifiable factual claims that are false
- Misleading statistics or cherry-picked data
- False attributions and quotes
- Conspiracy theories and unfounded claims
- Outdated information presented as current

Rate on a scale of 0-100 where:
- 0-20: Appears factually accurate
- 21-40: Contains minor inaccuracies
- 41-60: Significant false or misleading elements
- 61-80: Mostly false with some true elements
- 81-100: Almost entirely false or misleading

Provide a JSON response with this exact format:
{
  "score": <number>,
  "details": "<specific false claims and reasoning>"
}

Content to analyze:
"${content.substring(0, 1000)}"`,

  manipulation: (content: string) => `You are an expert in detecting psychological manipulation and dark patterns.

Analyze the following content for manipulation tactics, dark patterns, and exploitative persuasion. Consider:
- Emotional manipulation (fear, urgency, guilt)
- Dark patterns and psychological tricks
- Exploitative framing and scarcity tactics
- Deceptive presentation or hidden information
- Manipulation of cognitive biases
- Propaganda and loaded language

Rate on a scale of 0-100 where:
- 0-20: No manipulative tactics detected
- 21-40: Subtle persuasion techniques
- 41-60: Moderate manipulation elements
- 61-80: Strong manipulative tactics present
- 81-100: Highly manipulative or exploitative content

Provide a JSON response with this exact format:
{
  "score": <number>,
  "details": "<specific manipulation tactics identified and reasoning>"
}

Content to analyze:
"${content.substring(0, 1000)}"`,

  valuesAlignment: (content: string) => `You are analyzing content for alignment with universal human values.

Analyze the following content's alignment with these universal values:
- Human dignity and respect
- Truthfulness and honesty
- Personal autonomy and freedom
- Wellbeing and safety
- Justice and fairness
- Pluralism and inclusion

Rate on a scale of 0-100 where:
- 0-20: Strongly violates these values
- 21-40: Conflicts with multiple values
- 41-60: Mixed alignment with values
- 61-80: Generally aligns with values
- 81-100: Strongly promotes human values

Provide a JSON response with this exact format:
{
  "score": <number>,
  "details": "<assessment of value alignment and any conflicts>"
}

Content to analyze:
"${content.substring(0, 1000)}"`,
}

export const extractJsonFromResponse = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch {
    return null
  }
}

export const ensureScoreBounds = (score: number): number => {
  return Math.min(100, Math.max(0, Math.round(score)))
}
