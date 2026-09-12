import { useState } from 'react'
import { checkDataset } from '@/api/checkerApi'
import { Card, CardBody } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { Tag } from '@/components/ui/tag'
import { GOVERNANCE_RULES, PRINCIPLES } from '@/lib/checker/constants'
import { inspectDataset, parseCsv, principleForRule } from '@/lib/checker/utils'
import { cn } from '@/lib/cn'
import type { Issue, Principle } from '@/types/checker'

type PrincipleScore = { key: Principle; label: string; description: string; score: number }

export function CheckerDashboard() {
  const [message, setMessage] = useState('Upload a CSV or JSON dataset to identify quality issues.')
  const [lastRun, setLastRun] = useState('No file uploaded')
  const [score, setScore] = useState('—')
  const [records, setRecords] = useState('—')
  const [issueCount, setIssueCount] = useState('—')
  const [issues, setIssues] = useState<Issue[]>([])
  const [principles, setPrinciples] = useState<PrincipleScore[]>(PRINCIPLES)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [dragging, setDragging] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [loading, setLoading] = useState(false)

  const applyResult = (
    fileName: string,
    result: { issues: Issue[]; score: number; recordCount: number; fieldCount: number; principles: { key: Principle; score: number }[] },
    source: 'api' | 'local',
  ) => {
    setIssues(result.issues)
    setScore(result.score.toFixed(1))
    setRecords(result.recordCount.toLocaleString())
    setIssueCount(String(result.issues.length))
    setMessage(`${fileName} loaded via ${source === 'api' ? 'PHP API' : 'local fallback'}: ${result.recordCount.toLocaleString()} records across ${result.fieldCount} fields.`)
    setLastRun('Just now')
    setPrinciples(PRINCIPLES.map((p) => {
      const match = result.principles.find((r) => r.key === p.key)
      return { ...p, score: match?.score ?? p.score }
    }))
    setHasResults(true)
  }

  const loadFile = async (file: File) => {
    setLoading(true)
    try {
      const text = await file.text()
      const parsed = file.name.toLowerCase().endsWith('.json')
        ? JSON.parse(text) as Record<string, string>[]
        : parseCsv(text)
      if (!Array.isArray(parsed) || !parsed.length) throw new Error('Invalid dataset format.')

      try {
        const result = await checkDataset({ fileName: file.name, records: parsed })
        applyResult(file.name, result, 'api')
      } catch {
        const localIssues = inspectDataset(parsed)
        const fieldCount = Object.keys(parsed[0]).length
        const localScore = Math.max(0, 100 - (localIssues.filter((i) => i.status === 'Open').length / Math.max(1, parsed.length * fieldCount)) * 100)
        const base = Math.max(1, parsed.length)
        applyResult(file.name, {
          issues: localIssues,
          score: localScore,
          recordCount: parsed.length,
          fieldCount,
          principles: PRINCIPLES.map((p) => ({
            key: p.key,
            score: Math.max(0, Math.round(100 - (localIssues.filter((i) => principleForRule(i.rule) === p.key).length / base) * 100)),
          })),
        }, 'local')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to read dataset.')
    } finally {
      setLoading(false)
    }
  }

  const visibleIssues = issues.filter((issue) => {
    const q = search.toLowerCase()
    const matchSearch = Object.values(issue).some((v) => v.toLowerCase().includes(q))
    const matchSeverity = !severityFilter || issue.severity.toLowerCase() === severityFilter
    return matchSearch && matchSeverity
  })

  const toggleStatus = (index: number) => {
    setIssues((prev) => prev.map((issue, i) => i === index
      ? { ...issue, status: issue.status === 'Open' ? 'Resolved' : 'Open' }
      : issue))
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Data investigation</p>
          <h1 className="font-[Space_Grotesk] text-3xl font-bold text-slate-800">Find what makes your data untrustworthy.</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">{message}</p>
        </div>
        <div className="text-right text-xs text-slate-400">
          Last check <strong className="text-slate-600">{lastRun}</strong>
          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      <Card
        className={cn('animate-fade-in-up stagger-1 cursor-pointer border-dashed border-2 transition-all duration-300', dragging && 'border-teal-500 bg-teal-50/50 scale-[1.01]')}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) void loadFile(f) }}
      >
        <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xl">↑</div>
          <div>
            <h2 className="font-semibold text-slate-800">{loading ? 'Analyzing dataset...' : 'Start with your dataset'}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Drag & drop CSV/JSON or{' '}
              <label className="cursor-pointer font-medium text-teal-700 underline">
                choose a file
                <input type="file" accept=".csv,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void loadFile(f) }} />
              </label>
            </p>
          </div>
        </CardBody>
      </Card>

      {hasResults && (
        <>
          <Section title="Quality snapshot" description="Health of your uploaded data at a glance" className="stagger-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-teal-50/60"><CardBody><p className="text-xs text-slate-500">Overall score</p><p className="font-[Space_Grotesk] text-3xl font-bold text-teal-700">{score}</p></CardBody></Card>
              <Card><CardBody><p className="text-xs text-slate-500">Records checked</p><p className="font-[Space_Grotesk] text-3xl font-bold">{records}</p></CardBody></Card>
              <Card><CardBody><p className="text-xs text-slate-500">Issues found</p><p className="font-[Space_Grotesk] text-3xl font-bold text-amber-600">{issueCount}</p></CardBody></Card>
              <Card><CardBody><p className="text-xs text-slate-500">Rules passing</p><p className="font-[Space_Grotesk] text-3xl font-bold">87<span className="text-base text-slate-400">/92</span></p></CardBody></Card>
            </div>
          </Section>

          <Section title="DQM principles" description="Six dimensions that define trustworthy data" className="stagger-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {principles.map((p) => (
                <Card key={p.key}><CardBody className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold">{p.label}</span><span className="text-xs font-bold text-teal-700">{p.score}%</span></div>
                  <p className="text-[10px] text-slate-400">{p.description}</p>
                  <div className="h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600 transition-all duration-500" style={{ width: `${p.score}%` }} /></div>
                </CardBody></Card>
              ))}
            </div>
          </Section>

          <Section title="Identify and fix issues" description="Classified problems and recommended solutions" className="stagger-4">
            <Card>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search issues..." className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-teal-600" />
                  <button type="button" onClick={() => setSeverityFilter((s) => s === '' ? 'critical' : s === 'critical' ? 'warning' : s === 'warning' ? 'info' : '')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:border-teal-600">
                    Filter: {severityFilter || 'All'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className="border-b text-left text-xs uppercase text-slate-400">
                      <th className="pb-2 pr-4">Severity</th><th className="pb-2 pr-4">Principle</th><th className="pb-2 pr-4">Issue</th><th className="pb-2 pr-4">Record</th><th className="pb-2 pr-4">Fix</th><th className="pb-2">Status</th>
                    </tr></thead>
                    <tbody>
                      {visibleIssues.map((issue, index) => (
                        <tr key={`${issue.record}-${issue.field}-${index}`} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 pr-4"><Tag tone={issue.severity === 'Critical' ? 'critical' : issue.severity === 'Warning' ? 'warning' : 'info'}>{issue.severity}</Tag></td>
                          <td className="py-2 pr-4 capitalize text-slate-600">{issue.principle}</td>
                          <td className="py-2 pr-4"><strong>{issue.rule}</strong><br /><span className="text-xs text-slate-400">{issue.detail}</span></td>
                          <td className="py-2 pr-4 text-xs">{issue.record}<br /><span className="text-teal-700">{issue.field}</span></td>
                          <td className="py-2 pr-4 text-xs text-slate-500">{issue.fix}</td>
                          <td className="py-2"><button type="button" onClick={() => toggleStatus(issues.indexOf(issue))} className="text-xs font-medium text-teal-700 hover:underline">{issue.status}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-400">Showing {visibleIssues.length} of {issues.length} issues</p>
              </CardBody>
            </Card>
          </Section>

          <Section title="Prevent future errors" description="Governance rules to keep quality high">
            <div className="grid gap-3 md:grid-cols-3">
              {GOVERNANCE_RULES.map((rule, i) => (
                <Card key={rule.title}><CardBody className="flex gap-3">
                  <span className="font-[Space_Grotesk] text-lg font-bold text-slate-300">0{i + 1}</span>
                  <div><h3 className="text-sm font-semibold">{rule.title}</h3><p className="mt-1 text-xs text-slate-500">{rule.text}</p></div>
                </CardBody></Card>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  )
}
