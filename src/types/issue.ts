import type { Issue, Principle } from '@/types/checker'

export type IssueRecord = Issue & {
  id: number
  created_at?: string
  updated_at?: string
}

export type IssueFormData = {
  severity: Issue['severity']
  rule: string
  principle: Principle
  record: string
  field: string
  detail: string
  fix: string
  status: Issue['status']
}

export type IssuesResponse = {
  success: boolean
  data: IssueRecord[]
  message?: string
}

export type IssueResponse = {
  success: boolean
  data: IssueRecord
  message?: string
}

export const emptyIssueForm = (): IssueFormData => ({
  severity: 'Warning',
  rule: '',
  principle: 'completeness',
  record: '',
  field: '',
  detail: '',
  fix: '',
  status: 'Open',
})
