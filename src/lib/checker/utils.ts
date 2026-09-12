import type { Issue, Principle } from '@/types/checker'

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = [], cell = '', quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index], next = text[index + 1]
    if (character === '"' && quoted && next === '"') { cell += '"'; index += 1 }
    else if (character === '"') quoted = !quoted
    else if (character === ',' && !quoted) { row.push(cell.trim()); cell = '' }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []; cell = ''
    } else cell += character
  }
  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  const headers = (rows.shift() ?? []).map((header) => header.toLowerCase().replace(/\s+/g, '_'))
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

export function principleForRule(rule: Issue['rule']): Principle {
  if (rule === 'Required field') return 'completeness'
  if (rule === 'Duplicate detection' || rule === 'Duplicate names' || rule === 'Date format') return 'consistency'
  if (rule === 'Format validation' || rule === 'Value range') return 'accuracy'
  if (rule === 'Freshness check') return 'timeliness'
  if (rule === 'Business relevance') return 'relevance'
  return 'reliability'
}

export function inspectDataset(records: Record<string, string>[]): Issue[] {
  if (!records.length) return []
  const fields = Object.keys(records[0])
  const idField = fields.find((field) => /(^|_)(id|email)$/i.test(field)) ?? fields[0]
  const duplicateIds = new Set(records.map((r) => r[idField]).filter(Boolean).filter((v, i, a) => a.indexOf(v) !== i))
  const nameField = fields.find((field) => /(^|_)(full_?)?name$/i.test(field))
  const duplicateNames = nameField
    ? new Set(records.map((r) => r[nameField].trim().toLowerCase()).filter(Boolean).filter((v, i, a) => a.indexOf(v) !== i))
    : new Set<string>()

  return records.flatMap((record, index) => {
    const recordName = record[idField] || `Row ${index + 2}`
    const found: Issue[] = []
    fields.forEach((field) => {
      const value = record[field]
      if (!value) found.push({ severity: 'Critical', rule: 'Required field', principle: 'completeness', record: recordName, field, detail: 'Value is empty', fix: `Make ${field} required and reject blank values.`, status: 'Open' })
      if (field.includes('email') && value && !/^([^\s@]+)@[^\s@]+\.[^\s@]+$/.test(value)) found.push({ severity: 'Warning', rule: 'Format validation', principle: 'accuracy', record: recordName, field, detail: 'Invalid email format', fix: 'Apply format validation at ingestion.', status: 'Open' })
      if (/date/i.test(field) && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) found.push({ severity: 'Warning', rule: 'Date format', principle: 'consistency', record: recordName, field, detail: 'Date is not ISO 8601', fix: 'Standardize dates to YYYY-MM-DD.', status: 'Open' })
      if (/^(discount|score|percent|percentage|rate)$/i.test(field) && value && !Number.isNaN(Number(value)) && (Number(value) < 0 || Number(value) > 1)) found.push({ severity: 'Warning', rule: 'Value range', principle: 'accuracy', record: recordName, field, detail: 'Expected a value between 0 and 1', fix: 'Enforce a numeric range validation rule.', status: 'Open' })
    })
    if (duplicateIds.has(record[idField])) found.push({ severity: 'Warning', rule: 'Duplicate detection', principle: 'consistency', record: recordName, field: idField, detail: 'Duplicate identifier found', fix: 'Normalize and deduplicate using a stable ID.', status: 'Open' })
    if (nameField && duplicateNames.has(record[nameField].trim().toLowerCase())) found.push({ severity: 'Warning', rule: 'Duplicate names', principle: 'consistency', record: recordName, field: nameField, detail: 'Name appears in multiple records', fix: 'Use a unique ID for matching and merge confirmed duplicates.', status: 'Open' })
    return found
  })
}
