export interface EmailPreview {
  id: string
  subject: string
  date: string
  snippet: string
}

export interface NewsletterSender {
  id: string
  name: string
  email: string
  domain: string
  emailCount: number
  lastReceived: string
  confidenceScore: number
  unsubscribeMethod: 'http' | 'mailto' | 'unknown'
  unsubscribeUrl?: string
  unsubscribeEmail?: string
  isOneClick?: boolean
  sampleEmails: EmailPreview[]
  status: 'subscribed' | 'unsubscribed' | 'pending'
  riskLevel: 'low' | 'medium' | 'high'
  reasons: string[]
}

export interface AnalysisResult {
  newsletters: NewsletterSender[]
  totalAnalyzed: number
  healthScore: number
}

export interface AnalysisProgress {
  processed: number
  total: number
  status: 'idle' | 'fetching' | 'analyzing' | 'complete' | 'error'
  error?: string
}

export type FilterType = 'all' | 'high-confidence' | 'recent' | 'many-emails'
export type SortType = 'confidence' | 'count' | 'recent' | 'name'
