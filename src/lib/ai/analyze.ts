import Anthropic from '@anthropic-ai/sdk'
import { BusinessData, AiReportContent } from '@/types'
import { monthlyAnalysisPrompt, weeklyAnalysisPrompt, alertPrompt } from './prompts'
import { createAdminClient } from '@/lib/supabase/admin'

function getClient(apiKey?: string): Anthropic {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY non configurée. Ajoutez-la dans les variables d\'environnement Vercel.')
  return new Anthropic({ apiKey: key })
}

// Tool use schema — garantit un JSON structuré sans parsing manuel
const ANALYSIS_TOOL: Anthropic.Tool = {
  name: 'submit_analysis',
  description: 'Soumettre l\'analyse business structurée',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'Résumé en 3 phrases max' },
      strengths: { type: 'array', items: { type: 'string' }, description: '3-4 points forts' },
      weaknesses: { type: 'array', items: { type: 'string' }, description: '2-3 axes d\'amélioration' },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            priority: { type: 'string', enum: ['haute', 'moyenne', 'basse'] },
            action: { type: 'string' },
            impact: { type: 'string' },
          },
          required: ['priority', 'action', 'impact'],
          additionalProperties: false,
        },
      },
      competitor_analysis: { type: 'string', description: 'Analyse narrative des concurrents' },
      score_global: { type: 'number', description: 'Score global 0-100' },
    },
    required: ['summary', 'strengths', 'weaknesses', 'recommendations', 'score_global'],
    additionalProperties: false,
  },
}

// Tool pour les alertes
const ALERT_TOOL: Anthropic.Tool = {
  name: 'submit_alert',
  description: 'Soumettre les recommandations d\'alerte',
  input_schema: {
    type: 'object',
    properties: {
      alert: { type: 'string', description: 'Description de l\'alerte' },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            priority: { type: 'string', enum: ['haute', 'moyenne', 'basse'] },
            action: { type: 'string' },
            impact: { type: 'string' },
          },
          required: ['priority', 'action', 'impact'],
          additionalProperties: false,
        },
      },
    },
    required: ['alert', 'recommendations'],
    additionalProperties: false,
  },
}

async function runAnalysis(
  client: Anthropic,
  prompt: string
): Promise<AiReportContent> {
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: 'tool', name: 'submit_analysis' },
    messages: [{ role: 'user', content: prompt }],
  })

  const message = await stream.finalMessage()

  const toolUse = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
  )
  if (!toolUse) throw new Error('Claude n\'a pas retourné d\'analyse structurée')

  return toolUse.input as AiReportContent
}

function handleApiError(err: unknown): never {
  if (err instanceof Anthropic.RateLimitError) {
    throw new Error('Limite de l\'API Claude atteinte. Réessayez dans quelques instants.')
  } else if (err instanceof Anthropic.AuthenticationError) {
    throw new Error('Clé API Claude invalide. Vérifiez votre configuration dans les paramètres.')
  } else if (err instanceof Anthropic.APIError) {
    throw new Error(`Erreur API Claude (${err.status}) : ${err.message}`)
  }
  throw err
}

export async function analyzeMonthly(
  organizationId: string,
  data: BusinessData,
  clientApiKey?: string
): Promise<AiReportContent> {
  const client = getClient(clientApiKey)
  const prompt = monthlyAnalysisPrompt(data)

  let parsed: AiReportContent
  try {
    parsed = await runAnalysis(client, prompt)
  } catch (err) {
    handleApiError(err)
  }

  const supabase = createAdminClient()
  const { error: insertError } = await supabase.from('ai_reports').insert({
    organization_id: organizationId,
    report_type: 'monthly',
    content: parsed,
    summary: parsed.summary,
    recommendations: parsed.recommendations,
  })
  if (insertError) throw new Error(`Failed to save report: ${insertError.message}`)

  return parsed
}

export async function analyzeWeekly(
  organizationId: string,
  data: BusinessData,
  clientApiKey?: string
): Promise<AiReportContent> {
  const client = getClient(clientApiKey)
  const prompt = weeklyAnalysisPrompt(data)

  let parsed: AiReportContent
  try {
    parsed = await runAnalysis(client, prompt)
  } catch (err) {
    handleApiError(err)
  }

  const supabase = createAdminClient()
  const { error: insertError } = await supabase.from('ai_reports').insert({
    organization_id: organizationId,
    report_type: 'weekly',
    content: parsed,
    summary: parsed.summary,
    recommendations: parsed.recommendations,
  })
  if (insertError) throw new Error(`Failed to save report: ${insertError.message}`)

  return parsed
}

export async function analyzeAlert(
  organizationId: string,
  businessName: string,
  issue: string,
  clientApiKey?: string
): Promise<{ alert: string; recommendations: AiReportContent['recommendations'] }> {
  const client = getClient(clientApiKey)
  const prompt = alertPrompt(businessName, issue)

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      tools: [ALERT_TOOL],
      tool_choice: { type: 'tool', name: 'submit_alert' },
      messages: [{ role: 'user', content: prompt }],
    })

    const message = await stream.finalMessage()
    const toolUse = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    )
    if (!toolUse) throw new Error('Claude n\'a pas retourné d\'analyse structurée')

    const result = toolUse.input as { alert: string; recommendations: AiReportContent['recommendations'] }

    const supabase = createAdminClient()
    const { error: insertError } = await supabase.from('ai_reports').insert({
      organization_id: organizationId,
      report_type: 'alert',
      content: result,
      summary: result.alert,
      recommendations: result.recommendations,
    })
    if (insertError) throw new Error(`Failed to save report: ${insertError.message}`)

    return result
  } catch (err) {
    handleApiError(err)
  }
}
