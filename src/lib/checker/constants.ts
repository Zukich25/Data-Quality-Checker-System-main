import type { Principle } from '@/types/checker'

export const PRINCIPLES: { key: Principle; label: string; description: string; score: number }[] = [
  { key: 'accuracy', label: 'Accuracy', description: 'Values match the real world', score: 96 },
  { key: 'consistency', label: 'Consistency', description: 'Values agree across records', score: 94 },
  { key: 'completeness', label: 'Completeness', description: 'Required data is present', score: 93 },
  { key: 'timeliness', label: 'Timeliness', description: 'Data is current and available', score: 97 },
  { key: 'reliability', label: 'Reliability', description: 'Sources behave predictably', score: 95 },
  { key: 'relevance', label: 'Relevance', description: 'Data serves its intended use', score: 92 },
]

export const GOVERNANCE_RULES = [
  { title: 'Validate at ingestion', text: 'Reject missing required fields, invalid emails, unsupported dates, and out-of-range values before data enters production.' },
  { title: 'Standardize and monitor', text: 'Use shared formats and reference lists, then schedule freshness and quality checks with named owners and alerts.' },
  { title: 'Control changes', text: 'Version data definitions and validation rules; review schema changes and investigate recurring issues each release.' },
]
