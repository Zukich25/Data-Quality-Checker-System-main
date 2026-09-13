import type { Issue } from '@/types/checker'

export function computeCellStats(records: Record<string, string>[], issues: Issue[]) {
  if (!records.length) return { totalCells: 0, valid: 0, invalid: 0, missing: 0 }

  const fields = Object.keys(records[0])
  const totalCells = records.length * fields.length
  const missing = issues.filter((i) => i.rule === 'Required field').length
  const invalid = issues.filter((i) => i.rule !== 'Required field').length
  const valid = Math.max(0, totalCells - missing - invalid)

  return {
    totalCells,
    valid,
    invalid,
    missing,
    validPct: totalCells ? ((valid / totalCells) * 100).toFixed(1) : '0',
    invalidPct: totalCells ? ((invalid / totalCells) * 100).toFixed(1) : '0',
    missingPct: totalCells ? ((missing / totalCells) * 100).toFixed(1) : '0',
  }
}

export function guessColumnType(values: string[]): string {
  const sample = values.filter(Boolean).slice(0, 20)
  if (!sample.length) return 'Text'
  if (sample.every((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) return 'Email'
  if (sample.every((v) => /^\d+$/.test(v))) return 'Integer'
  if (sample.every((v) => /^\d{4}-\d{2}-\d{2}$/.test(v))) return 'Date'
  if (sample.every((v) => !Number.isNaN(Number(v)))) return 'Number'
  return 'Text'
}

export type ColumnBreakdown = {
  field: string
  valid: number
  invalid: number
  missing: number
  health: number
}

export function computeColumnBreakdown(records: Record<string, string>[], issues: Issue[]): ColumnBreakdown[] {
  if (!records.length) return []
  const fields = Object.keys(records[0])

  return fields.map((field) => {
    const fieldIssues = issues.filter((i) => i.field === field)
    const missing = fieldIssues.filter((i) => i.rule === 'Required field').length
    const invalid = fieldIssues.length - missing
    const total = records.length
    const valid = Math.max(0, total - missing - invalid)
    const health = total ? Math.round((valid / total) * 100) : 100

    return { field, valid, invalid, missing, health }
  })
}
