import { useMemo, useState } from 'react'
import { checkDataset } from '@/api/checkerApi'
import { autoCleanupDataset, downloadJson } from '@/lib/checker/cleanup'
import { PRINCIPLES } from '@/lib/checker/constants'
import { computeCellStats, computeColumnBreakdown, guessColumnType } from '@/lib/checker/stats'
import { inspectDataset, parseCsv, principleForRule } from '@/lib/checker/utils'
import { cn } from '@/lib/cn'
import type { Issue } from '@/types/checker'

type Stage = 'upload' | 'rules' | 'report'
type RowFilter = 'all' | 'valid' | 'invalid' | 'missing'

const COLUMN_TYPES = ['Text', 'Integer', 'Number', 'Email', 'Date'] as const

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function issueKey(issue: Issue, rowIndex: number) {
  return `${rowIndex}-${issue.field}`
}

export function CheckerDashboard() {
  const [stage, setStage] = useState<Stage>('upload')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [records, setRecords] = useState<Record<string, string>[]>([])
  const [columnTypes, setColumnTypes] = useState<Record<string, string>>({})
  const [issues, setIssues] = useState<Issue[]>([])
  const [score, setScore] = useState(0)
  const [analyzedAt, setAnalyzedAt] = useState('')
  const [gridFilter, setGridFilter] = useState<RowFilter>('all')
  const [issuesFilter, setIssuesFilter] = useState<RowFilter>('all')
  const [gridPage, setGridPage] = useState(1)
  const [cleanupMessage, setCleanupMessage] = useState('')
  const [cleanedRecords, setCleanedRecords] = useState<Record<string, string>[] | null>(null)

  const fields = useMemo(() => (records[0] ? Object.keys(records[0]) : []), [records])
  const stats = useMemo(() => computeCellStats(records, issues), [records, issues])
  const columnBreakdown = useMemo(() => computeColumnBreakdown(records, issues), [records, issues])

  const issueMap = useMemo(() => {
    const map = new Map<string, Issue>()
    records.forEach((record, rowIndex) => {
      const idField = fields.find((f) => /(^|_)(id|email)$/i.test(f)) ?? fields[0]
      const recordName = record[idField] || `Row ${rowIndex + 2}`
      issues
        .filter((i) => i.record === recordName)
        .forEach((issue) => map.set(issueKey(issue, rowIndex), issue))
    })
    return map
  }, [records, issues, fields])

  const rowHasIssue = (rowIndex: number, kind: RowFilter) => {
    const rowIssues = [...issueMap.entries()]
      .filter(([key]) => key.startsWith(`${rowIndex}-`))
      .map(([, issue]) => issue)
    if (!rowIssues.length) return kind === 'valid' || kind === 'all'
    if (kind === 'all') return true
    if (kind === 'missing') return rowIssues.some((i) => i.rule === 'Required field')
    if (kind === 'invalid') return rowIssues.some((i) => i.rule !== 'Required field')
    return false
  }

  const filteredRows = useMemo(() => {
    const indices = records.map((_, i) => i)
    if (gridFilter === 'all') return indices
    if (gridFilter === 'valid') return indices.filter((i) => rowHasIssue(i, 'valid'))
    if (gridFilter === 'missing') return indices.filter((i) => rowHasIssue(i, 'missing'))
    return indices.filter((i) => rowHasIssue(i, 'invalid'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, gridFilter, issueMap])

  const filteredIssues = useMemo(() => {
    if (issuesFilter === 'all') return issues
    if (issuesFilter === 'missing') return issues.filter((i) => i.rule === 'Required field')
    if (issuesFilter === 'invalid') return issues.filter((i) => i.rule !== 'Required field')
    return []
  }, [issues, issuesFilter])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const pageRows = filteredRows.slice((gridPage - 1) * pageSize, gridPage * pageSize)

  const parseFile = async (file: File) => {
    setLoading(true)
    setCleanupMessage('')
    setCleanedRecords(null)
    try {
      const text = await file.text()
      const parsed = file.name.toLowerCase().endsWith('.json')
        ? JSON.parse(text) as Record<string, string>[]
        : parseCsv(text)
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('Invalid dataset format.')

      const cols = Object.keys(parsed[0])
      const types: Record<string, string> = {}
      cols.forEach((col) => {
        types[col] = guessColumnType(parsed.map((r) => r[col] ?? ''))
      })

      setFileName(file.name)
      setFileSize(file.size)
      setRecords(parsed)
      setColumnTypes(types)
      setIssues([])
      setScore(0)
      setStage('rules')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to read dataset.')
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    setLoading(true)
    try {
      let result
      try {
        result = await checkDataset({ fileName, records })
      } catch {
        const localIssues = inspectDataset(records)
        const fieldCount = fields.length
        const localScore = Math.max(0, 100 - (localIssues.filter((i) => i.status === 'Open').length / Math.max(1, records.length * fieldCount)) * 100)
        const base = Math.max(1, records.length)
        result = {
          issues: localIssues,
          score: localScore,
          recordCount: records.length,
          fieldCount,
          principles: PRINCIPLES.map((p) => ({
            key: p.key,
            score: Math.max(0, Math.round(100 - (localIssues.filter((i) => principleForRule(i.rule) === p.key).length / base) * 100)),
          })),
        }
      }
      setIssues(result.issues)
      setScore(result.score)
      setAnalyzedAt(new Date().toLocaleString())
      setStage('report')
      setGridPage(1)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = () => {
    const result = autoCleanupDataset(records)
    setCleanedRecords(result.cleaned)
    setCleanupMessage(`Automatic cleanup complete: ${result.fixesApplied} fixes applied, ${result.removedRows} empty rows removed.`)
    downloadJson(fileName.replace(/\.[^.]+$/, '') + '-cleaned.json', result.cleaned)
  }

  const exportReport = () => {
    downloadJson(fileName.replace(/\.[^.]+$/, '') + '-quality-report.json', {
      fileName,
      analyzedAt,
      score,
      stats,
      columnBreakdown,
      issues,
    })
  }

  const resetAll = () => {
    setStage('upload')
    setFileName('')
    setFileSize(0)
    setRecords([])
    setColumnTypes({})
    setIssues([])
    setScore(0)
    setCleanupMessage('')
    setCleanedRecords(null)
    setGridFilter('all')
    setIssuesFilter('all')
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Hero / Upload */}
      <section className="animate-fade-in-up text-center">
        <h1 className="font-[Space_Grotesk] text-3xl font-bold leading-tight text-white md:text-5xl">
          Analyse your messy CSV files to get a{' '}
          <span className="gradient-text">Data Quality Report</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#8b9bb8] md:text-base">
          Stop scrolling through spreadsheets hunting for errors. Upload your CSV and let SODA identify invalid values,
          missing fields, and column health in seconds.
        </p>

        <div
          className={cn(
            'glass-panel mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-dashed p-8 transition-all md:p-12',
            dragging ? 'border-violet-400 bg-violet-500/10 scale-[1.01]' : 'border-[#243049]',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) void parseFile(f) }}
        >
          <p className="text-[#c8d2e8]">Drag &amp; drop your CSV here, or</p>
          <label className="btn-primary mt-4 inline-block cursor-pointer px-6 py-2.5 text-sm">
            Choose File
            <input type="file" accept=".csv,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void parseFile(f) }} />
          </label>
          <p className="mt-4 text-xs text-[#8b9bb8]">Your file is processed locally — nothing leaves your browser unless you use the API.</p>
        </div>

        {fileName && stage !== 'upload' && (
          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-2 rounded-lg bg-[#151d32] px-4 py-2 text-xs text-[#c8d2e8]">
            <span className="font-medium text-violet-300">{fileName}</span>
            <span>|</span>
            <span>{formatBytes(fileSize)}</span>
            <span>|</span>
            <span>{records.length.toLocaleString()} rows</span>
            <span>|</span>
            <span>{fields.length} columns</span>
          </div>
        )}

        {loading && stage === 'upload' && (
          <p className="mt-3 text-sm text-amber-300 animate-fade-in">Reading your file...</p>
        )}
      </section>

      {/* Review Column Rules */}
      {stage === 'rules' && (
        <section className="glass-panel animate-fade-in-up rounded-2xl p-5 md:p-8">
          <h2 className="font-[Space_Grotesk] text-xl font-bold text-white md:text-2xl">Review column rules</h2>
          <p className="mt-1 text-sm text-[#8b9bb8]">Choose data types for each column. SODA auto-detected these from your sample data.</p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#243049] text-left text-xs uppercase text-[#8b9bb8]">
                  {fields.map((field) => (
                    <th key={field} className="pb-3 pr-4 whitespace-nowrap">
                      <div className="mb-2 font-medium normal-case text-[#c8d2e8]">{field.replace(/_/g, ' ')}</div>
                      <select
                        value={columnTypes[field] ?? 'Text'}
                        onChange={(e) => setColumnTypes((prev) => ({ ...prev, [field]: e.target.value }))}
                        className="rounded-lg border border-[#243049] bg-[#0a1020] px-2 py-1 text-xs text-white outline-none focus:border-violet-500"
                      >
                        {COLUMN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 3).map((row, ri) => (
                  <tr key={ri} className="border-b border-[#243049]/50">
                    {fields.map((field) => (
                      <td key={field} className="py-2 pr-4 text-[#8b9bb8] whitespace-nowrap max-w-[140px] truncate">{row[field] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => void runAnalysis()} disabled={loading} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
              {loading ? 'Analyzing...' : 'Analyze Data Quality'}
            </button>
          </div>
        </section>
      )}

      {/* Quality Report */}
      {stage === 'report' && (
        <>
          <section className="glass-panel animate-fade-in-up rounded-2xl p-5 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-[Space_Grotesk] text-xl font-bold text-white md:text-2xl">Quality report</h2>
                <p className="mt-1 text-xs text-[#8b9bb8]">
                  {fileName} · {analyzedAt} · {records.length.toLocaleString()} rows · {fields.length} columns · {formatBytes(fileSize)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => window.print()} className="rounded-lg border border-[#243049] px-3 py-1.5 text-xs text-[#c8d2e8] hover:border-violet-500">Export PDF</button>
                <button type="button" onClick={exportReport} className="rounded-lg border border-[#243049] px-3 py-1.5 text-xs text-[#c8d2e8] hover:border-violet-500">Export JSON</button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="font-[Space_Grotesk] text-5xl font-bold text-white md:text-6xl">{Math.round(score)}%</div>
              <div className="min-w-[200px] flex-1">
                <div className="h-3 overflow-hidden rounded-full bg-[#0a1020]">
                  <div className="progress-gradient h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, score)}%` }} />
                </div>
                <p className="mt-2 text-xs text-[#8b9bb8]">Overall quality score</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>✓</span>
                  <span className="text-xs font-semibold uppercase tracking-wide">Valid</span>
                </div>
                <p className="mt-2 font-[Space_Grotesk] text-2xl font-bold text-white">{stats.valid.toLocaleString()}</p>
                <p className="text-xs text-emerald-300/80">{stats.validPct}%</p>
              </div>
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-center gap-2 text-red-400">
                  <span>✕</span>
                  <span className="text-xs font-semibold uppercase tracking-wide">Invalid</span>
                </div>
                <p className="mt-2 font-[Space_Grotesk] text-2xl font-bold text-white">{stats.invalid.toLocaleString()}</p>
                <p className="text-xs text-red-300/80">{stats.invalidPct}%</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <span>⚠</span>
                  <span className="text-xs font-semibold uppercase tracking-wide">Missing</span>
                </div>
                <p className="mt-2 font-[Space_Grotesk] text-2xl font-bold text-white">{stats.missing.toLocaleString()}</p>
                <p className="text-xs text-amber-300/80">{stats.missingPct}%</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-[#c8d2e8]">Column breakdown</h3>
              <div className="mt-4 space-y-3">
                {columnBreakdown.map((col) => (
                  <div key={col.field}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-[#c8d2e8]">{col.field.replace(/_/g, ' ')}</span>
                      <span className="text-[#8b9bb8]">{col.health}% healthy</span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-[#0a1020]">
                      <div className="bg-emerald-500" style={{ width: `${(col.valid / Math.max(1, records.length)) * 100}%` }} />
                      <div className="bg-red-500" style={{ width: `${(col.invalid / Math.max(1, records.length)) * 100}%` }} />
                      <div className="bg-amber-500" style={{ width: `${(col.missing / Math.max(1, records.length)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Data Grid */}
          <section className="glass-panel animate-fade-in-up rounded-2xl p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-[Space_Grotesk] text-lg font-bold text-white">Data grid</h2>
              <div className="flex flex-wrap gap-1">
                {(['all', 'valid', 'invalid', 'missing'] as RowFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setGridFilter(f); setGridPage(1) }}
                    className={cn(
                      'rounded-lg px-3 py-1 text-xs capitalize transition-colors',
                      gridFilter === f ? 'bg-violet-600/30 text-violet-200' : 'text-[#8b9bb8] hover:text-white',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-[#243049] text-left text-[#8b9bb8]">
                    <th className="pb-2 pr-3">#</th>
                    {fields.map((field) => (
                      <th key={field} className="pb-2 pr-3 whitespace-nowrap">{field.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((rowIndex) => (
                    <tr key={rowIndex} className="border-b border-[#243049]/40">
                      <td className="py-2 pr-3 text-[#8b9bb8]">{rowIndex + 1}</td>
                      {fields.map((field) => {
                        const issue = issueMap.get(`${rowIndex}-${field}`)
                        return (
                          <td
                            key={field}
                            className={cn(
                              'py-2 pr-3 whitespace-nowrap max-w-[160px] truncate',
                              issue?.rule === 'Required field' && 'bg-amber-500/20 text-amber-200',
                              issue && issue.rule !== 'Required field' && 'bg-red-500/20 text-red-200',
                              !issue && 'text-[#c8d2e8]',
                            )}
                          >
                            {records[rowIndex][field] || '—'}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#8b9bb8]">
              <span>Showing {pageRows.length} of {filteredRows.length} rows</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={gridPage <= 1} onClick={() => setGridPage((p) => p - 1)} className="rounded border border-[#243049] px-2 py-1 disabled:opacity-40">Prev</button>
                <span>Page {gridPage} of {totalPages}</span>
                <button type="button" disabled={gridPage >= totalPages} onClick={() => setGridPage((p) => p + 1)} className="rounded border border-[#243049] px-2 py-1 disabled:opacity-40">Next</button>
              </div>
            </div>
          </section>

          {/* Issues Found */}
          <section className="glass-panel animate-fade-in-up rounded-2xl p-5 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-[Space_Grotesk] text-lg font-bold text-white">Issues found</h2>
              <div className="flex flex-wrap gap-1">
                {(['all', 'invalid', 'missing'] as RowFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setIssuesFilter(f)}
                    className={cn(
                      'rounded-lg px-3 py-1 text-xs capitalize transition-colors',
                      issuesFilter === f ? 'bg-violet-600/30 text-violet-200' : 'text-[#8b9bb8] hover:text-white',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#243049] text-left text-xs uppercase text-[#8b9bb8]">
                    <th className="pb-2 pr-4">Row</th>
                    <th className="pb-2 pr-4">Column</th>
                    <th className="pb-2 pr-4">Value</th>
                    <th className="pb-2">Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.slice(0, 50).map((issue, i) => {
                    const rowMatch = records.findIndex((r) => {
                      const idField = fields.find((f) => /(^|_)(id|email)$/i.test(f)) ?? fields[0]
                      return (r[idField] || '') === issue.record || issue.record.includes(String(records.indexOf(r) + 2))
                    })
                    const value = rowMatch >= 0 ? records[rowMatch][issue.field] : '—'
                    return (
                      <tr key={`${issue.record}-${issue.field}-${i}`} className="border-b border-[#243049]/40">
                        <td className="py-2 pr-4 text-[#c8d2e8]">{issue.record}</td>
                        <td className="py-2 pr-4 text-violet-300">{issue.field.replace(/_/g, ' ')}</td>
                        <td className="py-2 pr-4 text-[#8b9bb8] max-w-[120px] truncate">{value || '—'}</td>
                        <td className="py-2">
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-xs',
                            issue.rule === 'Required field' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300',
                          )}>
                            {issue.detail}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredIssues.length > 50 && (
              <p className="mt-2 text-xs text-[#8b9bb8]">Showing first 50 of {filteredIssues.length} issues</p>
            )}
          </section>

          <div className="flex justify-center">
            <button type="button" onClick={resetAll} className="rounded-lg border border-[#243049] px-4 py-2 text-sm text-[#c8d2e8] hover:border-violet-500">
              Analyze another dataset
            </button>
          </div>
        </>
      )}

      {/* Cleanup CTA */}
      {stage === 'report' && (
        <section className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-900/40 via-[#151d32] to-teal-900/30 p-8 text-center md:p-12 animate-fade-in-up">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.25),transparent_60%)]" />
          <div className="relative">
            <h2 className="font-[Space_Grotesk] text-2xl font-bold text-white md:text-3xl">
              You&apos;ve spotted the issues — now automate the cleanup.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#8b9bb8]">
              SODA trims whitespace, removes empty rows, and deduplicates records automatically. Download your cleaned dataset instantly.
            </p>
            <button type="button" onClick={handleCleanup} className="btn-primary mt-6 px-8 py-3 text-sm">
              Automatic Cleanup Function
            </button>
            {cleanupMessage && (
              <p className="mt-4 text-sm text-teal-300 animate-fade-in">{cleanupMessage}</p>
            )}
            {cleanedRecords && (
              <p className="mt-2 text-xs text-[#8b9bb8]">{cleanedRecords.length.toLocaleString()} rows ready · JSON downloaded</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
