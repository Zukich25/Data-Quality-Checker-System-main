export type CleanupResult = {
  cleaned: Record<string, string>[]
  fixesApplied: number
  removedRows: number
}

export function autoCleanupDataset(records: Record<string, string>[]): CleanupResult {
  let fixesApplied = 0
  const seen = new Set<string>()
  const idKey = Object.keys(records[0] ?? {})[0] ?? 'id'

  const trimmed = records.map((record) => {
    const next: Record<string, string> = {}
    Object.entries(record).forEach(([key, value]) => {
      const trimmedValue = value.trim()
      if (trimmedValue !== value) fixesApplied += 1
      next[key] = trimmedValue
    })
    return next
  })

  const withoutEmpty = trimmed.filter((record) => {
    const hasData = Object.values(record).some(Boolean)
    return hasData
  })

  const removedRows = trimmed.length - withoutEmpty.length

  const deduped = withoutEmpty.filter((record, index) => {
    const key = record[idKey] || `row-${index}`
    if (seen.has(key)) {
      fixesApplied += 1
      return false
    }
    seen.add(key)
    return true
  })

  return {
    cleaned: deduped,
    fixesApplied: fixesApplied + removedRows,
    removedRows,
  }
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
