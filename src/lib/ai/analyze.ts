import Anthropic from '@anthropic-ai/sdk'
import { BusinessData, AiReportContent } from '@/types'
import { monthlyAnalysisPrompt } from './prompts'
import { createAdminClient } from '@/lib/supabase/admin'

function getClient(apiKey?: string): Anthropic {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY non configurée. Ajoutez-la dans les variables d\'environnement Vercel.')
  return new Anthropic({ apiKey: key })
}

export async function analyzeMonthly(
  organizationId: string,
  data: BusinessData,
  clientApiKey?: string
): Promise<AiReportContent> {
  const client = getClient(clientApiKey)
  const prompt = monthlyAnalysisPrompt(data)

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Supprimer les éventuelles balises markdown ```json ... ```
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

  let parsed: AiReportContent
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Claude a retourné un JSON invalide : ${cleaned.slice(0, 200)}`)
  }

  // Persistance en BDD
  const supabase = createAdminClient()
  await supabase.from('ai_reports').insert({
    organization_id: organizationId,
    report_type: 'monthly',
    content: parsed,
    summary: parsed.summary,
    recommendations: parsed.recommendations,
  })

  return parsed
}
