export type Principle =
  | 'accuracy'
  | 'consistency'
  | 'completeness'
  | 'timeliness'
  | 'reliability'
  | 'relevance'

export type Issue = {
  severity: 'Critical' | 'Warning' | 'Info'
  rule: string
  principle: Principle
  record: string
  field: string
  detail: string
  fix: string
  status: 'Open' | 'Resolved'
}

export type PrincipleScore = {
  key: Principle
  label: string
  description: string
  score: number
}

export type CheckDatasetRequest = {
  fileName: string
  records: Record<string, string>[]
}

export type CheckDatasetResponse = {
  success: boolean
  data: {
    issues: Issue[]
    score: number
    recordCount: number
    fieldCount: number
    principles: PrincipleScore[]
  }
}

export type HealthResponse = {
  success: boolean
  message: string
  backend: string
}
