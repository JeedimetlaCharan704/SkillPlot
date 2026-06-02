import OpenAI from 'openai'
import env from '../config/env'
import logger from './logger.service'

let openai: OpenAI | null = null

function getClient(): OpenAI | null {
  if (openai) return openai
  if (!env.openaiApiKey) return null
  openai = new OpenAI({ apiKey: env.openaiApiKey })
  return openai
}

function isAvailable(): boolean {
  return !!env.openaiApiKey
}

async function analyzeResume(textContent: string, targetRole?: string): Promise<any> {
  const client = getClient()
  if (!client) return null

  try {
    const roleContext = targetRole ? ` for the role of ${targetRole}` : ''

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume analyst. Analyze the resume text and return a JSON object (no markdown, no code fences) with:

{
  "scores": { "overall": 0-100, "skills": 0-100, "experience": 0-100, "education": 0-100, "projects": 0-100, "certifications": 0-100 },
  "strengths": ["string array of 2-4 strengths"],
  "weaknesses": ["string array of 2-4 weaknesses"],
  "suggestions": ["string array of 3-5 actionable suggestions"],
  "matchedKeywords": ["skills found"],
  "missingKeywords": ["important missing skills"],
  "keywordMatches": [{"keyword": "skill", "found": true/false, "category": "programming|frontend|backend|databases|devops|cloud|ai-ml|tools|testing|data-viz|methodology", "importance": "critical|important|nice-to-have"}]
}

Score based on: keyword relevance, experience depth, project quality, education fit, certifications. Be strict but fair.`,
        },
        {
          role: 'user',
          content: `Resume text:\n\n${textContent.slice(0, 15000)}\n\nTarget role: ${roleContext || 'Not specified'}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    })

    const raw = response.choices[0]?.message?.content?.trim()
    if (!raw) throw new Error('Empty response from OpenAI')

    const json = JSON.parse(raw.replace(/```json\s*/gi, '').replace(/```\s*$/g, ''))
    logger.info('OpenAI resume analysis completed', { tokens: response.usage?.total_tokens })
    return json
  } catch (err: any) {
    logger.error('OpenAI analysis failed', { error: err.message })
    return null
  }
}

export { analyzeResume, isAvailable }
