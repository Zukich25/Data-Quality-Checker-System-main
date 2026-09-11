import { checkDataset } from '@/api/checkerApi'
import type { Issue, Principle } from '@/types/checker'

const principles: { key: Principle; label: string; description: string; score: number }[] = [
  { key: 'accuracy', label: 'Accuracy', description: 'Values match the real world', score: 96 },
  { key: 'consistency', label: 'Consistency', description: 'Values agree across records', score: 94 },
  { key: 'completeness', label: 'Completeness', description: 'Required data is present', score: 93 },
  { key: 'timeliness', label: 'Timeliness', description: 'Data is current and available', score: 97 },
  { key: 'reliability', label: 'Reliability', description: 'Sources behave predictably', score: 95 },
  { key: 'relevance', label: 'Relevance', description: 'Data serves its intended use', score: 92 },
]

const governanceRules = [
  { title: 'Validate at ingestion', text: 'Reject missing required fields, invalid emails, unsupported dates, and out-of-range values before data enters production.' },
  { title: 'Standardize and monitor', text: 'Use shared formats and reference lists, then schedule freshness and quality checks with named owners and alerts.' },
  { title: 'Control changes', text: 'Version data definitions and validation rules; review schema changes and investigate recurring issues each release.' },
]

let issues: Issue[] = []

const icon = (name: string) => `<span class="icon icon-${name}" aria-hidden="true"></span>`

export function initCheckerApp(container: HTMLElement) {
  container.innerHTML = `
  <div class="app-shell">
    <main class="main-content">
      <header class="checker-header"><div class="brand"><div class="brand-mark">DQ</div><div><strong>Data Quality Checker System</strong><span>DQM investigation workspace</span></div></div></header>
      <section class="hero-row"><div><span class="eyebrow">Data investigation</span><h1>Find what makes your data untrustworthy.</h1><p id="dataset-message">Upload a CSV or JSON dataset to identify quality issues, classify them against DQM principles, and propose practical fixes.</p></div><div class="last-run">Last check <strong id="last-run">No file uploaded</strong><span class="status-dot"></span></div></section>
      <section class="upload-box" id="upload-box"><input id="dataset-upload" type="file" accept=".csv,.json,text/csv,application/json" hidden><div class="upload-icon">${icon('upload')}</div><div><h2>Start with your dataset</h2><p>Drag and drop a CSV or JSON file here, or <button class="upload-link" id="upload-button">choose a file</button></p><span>Checked via React + Axios API (PHP backend)</span></div></section>
      <section class="section-block hidden" id="metrics-section"><div class="section-heading"><div><div><h2>Quality snapshot</h2><p>See the health of your uploaded data at a glance</p></div></div></div><div class="metrics-grid">
        <article class="metric-card featured"><div class="metric-head"><span>Overall quality score</span><span class="trend up">↗ 2.4%</span></div><div class="score-line"><strong id="score">94.8</strong><span>/ 100</span><div class="ring"><div></div></div></div><p>Across all active datasets</p></article>
        <article class="metric-card"><div class="metric-head"><span>Records checked</span>${icon('dots')}</div><strong class="metric-value" id="records">1.24M</strong><p><span class="trend up">↗ 8.2%</span> vs last run</p></article>
        <article class="metric-card"><div class="metric-head"><span>Issues found</span>${icon('dots')}</div><strong class="metric-value coral" id="issues-count">23</strong><p><span class="trend down">↘ 12.5%</span> vs last run</p></article>
        <article class="metric-card"><div class="metric-head"><span>Rules passing</span>${icon('dots')}</div><strong class="metric-value">87<span class="denom">/ 92</span></strong><p><span class="trend up">↗ 3 rules</span> since Monday</p></article>
      </div></section>
      <section class="principles-section hidden" id="principles-section"><div class="section-heading"><div><div><h2>DQM principles</h2><p>Six dimensions that define trustworthy data</p></div></div><span class="principles-badge">Framework aligned</span></div><div class="principles-grid" id="principles-grid">${principles.map((principle) => `<article class="principle-card"><div class="principle-top"><span class="principle-icon ${principle.key}">${principle.label.slice(0, 1)}</span><strong>${principle.label}</strong><b data-principle-score="${principle.key}">${principle.score}%</b></div><p>${principle.description}</p><div class="principle-bar"><span data-principle-bar="${principle.key}" style="width: ${principle.score}%"></span></div></article>`).join('')}</div></section>
      <section class="panel issues-panel hidden" id="issues-panel"><div class="panel-header issues-head"><div><div><h3>Identify and fix issues</h3><p>Classified data quality problems and recommended solutions</p></div></div><div class="issue-tools"><div class="search-box">${icon('search')}<input id="issue-search" placeholder="Search by issue, field, or principle" /></div><button class="filter-button" id="filter-button">${icon('filter')}All issues <span>⌄</span></button></div></div><div class="table-wrap"><table><thead><tr><th>Severity</th><th>DQM principle</th><th>Issue</th><th>Record / field</th><th>Proposed fix</th><th>Status</th></tr></thead><tbody id="issues-body"></tbody></table></div><div class="table-footer"><span id="issue-summary">Showing 7 of 7 issues</span><span class="text-link">At least 5 issues identified</span></div></section>
      <section class="governance-section hidden" id="governance-section"><div class="section-heading"><div><div><h2>Prevent future errors</h2><p>Simple governance rules to keep quality high over time</p></div></div></div><div class="governance-grid">${governanceRules.map((rule, index) => `<article class="governance-card"><span class="governance-number">0${index + 1}</span><div><h3>${rule.title}</h3><p>${rule.text}</p></div></article>`).join('')}</div></section>
      <footer>Checkmate Data Quality System <span>•</span> Environment: Production <span>•</span> v2.4.1</footer>
    </main>
  </div>
`

  const updateMetric = (selector: string, value: string) => { document.querySelector(selector)!.textContent = value }

  const principleForRule = (rule: Issue['rule']): Principle => {
    if (rule === 'Required field') return 'completeness'
    if (rule === 'Duplicate detection' || rule === 'Duplicate names') return 'consistency'
    if (rule === 'Format validation' || rule === 'Value range') return 'accuracy'
    if (rule === 'Date format') return 'consistency'
    if (rule === 'Freshness check') return 'timeliness'
    if (rule === 'Business relevance') return 'relevance'
    return 'reliability'
  }

  const renderIssues = (filter = '') => {
    const query = filter.toLowerCase()
    const visible = issues.filter((issue) => {
      const matchesSearch = Object.values(issue).some((value) => value.toLowerCase().includes(query))
      const matchesSeverity = !query || query === issue.severity.toLowerCase()
      return matchesSearch || matchesSeverity
    })
    document.querySelector<HTMLTableSectionElement>('#issues-body')!.innerHTML = visible.map((issue) => `<tr class="issue-row" data-issue-index="${issues.indexOf(issue)}"><td><span class="severity ${issue.severity.toLowerCase()}">${issue.severity}</span></td><td><span class="principle-tag ${issue.principle}">${issue.principle}</span></td><td><strong class="issue-rule">${issue.rule}</strong><span class="issue-detail">${issue.detail}</span></td><td><span class="mono">${issue.record}</span><span class="issue-detail mono field">${issue.field}</span></td><td class="fix">${issue.fix}</td><td><span class="issue-status ${issue.status.toLowerCase()}"><span></span>${issue.status}</span></td></tr>`).join('')
    document.querySelector('#issue-summary')!.textContent = `Showing ${visible.length} of ${issues.length} issues`

    document.querySelectorAll('.issue-row').forEach((row) => {
      row.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        if (target.closest('.issue-status')) {
          const issueIndex = parseInt(row.getAttribute('data-issue-index') || '0', 10)
          const issue = issues[issueIndex]
          if (issue) {
            issue.status = issue.status === 'Open' ? 'Resolved' : 'Open'
            renderIssues(filter)
          }
        }
      })
    })
  }

  const parseCsv = (text: string): Record<string, string>[] => {
    const rows: string[][] = []
    let row: string[] = [], cell = '', quoted = false
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index], next = text[index + 1]
      if (character === '"' && quoted && next === '"') { cell += '"'; index += 1 }
      else if (character === '"') quoted = !quoted
      else if (character === ',' && !quoted) { row.push(cell.trim()); cell = '' }
      else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && next === '\n') index += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = '' }
      else cell += character
    }
    row.push(cell.trim()); if (row.some(Boolean)) rows.push(row)
    const headers = (rows.shift() ?? []).map((header) => header.toLowerCase().replace(/\s+/g, '_'))
    return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
  }

  const inspectDataset = (records: Record<string, string>[]): Issue[] => {
    if (!records.length) return []
    const fields = Object.keys(records[0])
    const idField = fields.find((field) => /(^|_)(id|email)$/i.test(field)) ?? fields[0]
    const duplicateIds = new Set(records.map((record) => record[idField]).filter(Boolean).filter((value, index, values) => values.indexOf(value) !== index))
    const nameField = fields.find((field) => /(^|_)(full_?)?name$/i.test(field))
    const duplicateNames = nameField ? new Set(records.map((record) => record[nameField].trim().toLowerCase()).filter(Boolean).filter((value, index, values) => values.indexOf(value) !== index)) : new Set<string>()
    return records.flatMap((record, index) => {
      const recordName = record[idField] || `Row ${index + 2}`
      const found: Issue[] = []
      fields.forEach((field) => {
        const value = record[field]
        if (!value) found.push({ severity: 'Critical', rule: 'Required field', principle: 'completeness', record: recordName, field, detail: 'Value is empty', fix: `Make ${field} required and reject blank values.`, status: 'Open' })
        if (field.includes('email') && value && !/^([^\s@]+)@[^\s@]+\.[^\s@]+$/.test(value)) found.push({ severity: 'Warning', rule: 'Format validation', principle: 'accuracy', record: recordName, field, detail: 'Invalid email format', fix: 'Apply format validation at ingestion.', status: 'Open' })
        if (/date/i.test(field) && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) found.push({ severity: 'Warning', rule: 'Date format', principle: 'consistency', record: recordName, field, detail: 'Date is not ISO 8601', fix: 'Standardize dates to YYYY-MM-DD.', status: 'Open' })
        if (/^(discount|score|percent|percentage|rate)$/i.test(field) && value && (!Number.isNaN(Number(value)) && (Number(value) < 0 || Number(value) > 1))) found.push({ severity: 'Warning', rule: 'Value range', principle: 'accuracy', record: recordName, field, detail: 'Expected a value between 0 and 1', fix: 'Enforce a numeric range validation rule.', status: 'Open' })
      })
      if (duplicateIds.has(record[idField])) found.push({ severity: 'Warning', rule: 'Duplicate detection', principle: 'consistency', record: recordName, field: idField, detail: 'Duplicate identifier found', fix: 'Normalize and deduplicate using a stable ID.', status: 'Open' })
      if (nameField && duplicateNames.has(record[nameField].trim().toLowerCase())) found.push({ severity: 'Warning', rule: 'Duplicate names', principle: 'consistency', record: recordName, field: nameField, detail: 'Name appears in multiple records', fix: 'Use a unique ID for matching and merge confirmed duplicates.', status: 'Open' })
      return found
    })
  }

  const applyCheckResult = (
    fileName: string,
    result: {
      issues: Issue[]
      score: number
      recordCount: number
      fieldCount: number
      principles: { key: Principle; score: number }[]
    },
    source: 'api' | 'local',
  ) => {
    issues = result.issues
    updateMetric('#score', result.score.toFixed(1))
    updateMetric('#records', result.recordCount.toLocaleString())
    updateMetric('#issues-count', String(issues.length))
    document.querySelector('#dataset-message')!.textContent = `${fileName} loaded via ${source === 'api' ? 'PHP API' : 'local fallback'}: ${result.recordCount.toLocaleString()} records checked across ${result.fieldCount} fields.`
    document.querySelector('#last-run')!.textContent = 'Just now'

    result.principles.forEach((principle) => {
      const existing = principles.find((item) => item.key === principle.key)
      if (existing) existing.score = principle.score
      document.querySelector(`[data-principle-score="${principle.key}"]`)!.textContent = `${principle.score}%`
      document.querySelector<HTMLElement>(`[data-principle-bar="${principle.key}"]`)!.style.width = `${principle.score}%`
    })

    renderIssues()
    document.querySelector('#metrics-section')!.classList.remove('hidden')
    document.querySelector('#principles-section')!.classList.remove('hidden')
    document.querySelector('#issues-panel')!.classList.remove('hidden')
    document.querySelector('#governance-section')!.classList.remove('hidden')
  }

  const loadDataset = async (file: File) => {
    const text = await file.text()
    const records = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) as Record<string, string>[] : parseCsv(text)
    if (!Array.isArray(records) || !records.length || typeof records[0] !== 'object') throw new Error('The file must contain an array of objects or a CSV header row.')

    try {
      const result = await checkDataset({ fileName: file.name, records })
      applyCheckResult(file.name, result, 'api')
    } catch {
      issues = inspectDataset(records)
      const fieldCount = Object.keys(records[0]).length
      const score = Math.max(0, 100 - (issues.filter((issue) => issue.status === 'Open').length / Math.max(1, records.length * fieldCount)) * 100)
      const basePenalty = Math.max(1, records.length)
      const principleScores = principles.map((principle) => {
        const relatedIssues = issues.filter((issue) => principleForRule(issue.rule) === principle.key).length
        const principleScore = Math.max(0, Math.round(100 - (relatedIssues / basePenalty) * 100))
        principle.score = principleScore
        return { key: principle.key, score: principleScore }
      })

      applyCheckResult(
        file.name,
        {
          issues,
          score,
          recordCount: records.length,
          fieldCount,
          principles: principleScores,
        },
        'local',
      )
    }
  }

  document.querySelector<HTMLInputElement>('#issue-search')!.addEventListener('input', (event) => renderIssues((event.target as HTMLInputElement).value))
  document.querySelector('#upload-button')!.addEventListener('click', () => document.querySelector<HTMLInputElement>('#dataset-upload')!.click())

  let filterSeverity = ''
  const filterButton = document.querySelector('#filter-button') as HTMLButtonElement
  filterButton?.addEventListener('click', () => {
    const severities = ['', 'critical', 'warning', 'info']
    const currentIndex = severities.indexOf(filterSeverity)
    filterSeverity = severities[(currentIndex + 1) % severities.length]

    if (filterSeverity) {
      filterButton.classList.add('active')
      filterButton.innerHTML = `${icon('filter')}<span>${filterSeverity.charAt(0).toUpperCase() + filterSeverity.slice(1)} issues</span>`
    } else {
      filterButton.classList.remove('active')
      filterButton.innerHTML = `${icon('filter')}All issues <span>⌄</span>`
    }

    renderIssues(filterSeverity)
  })
  const uploadBox = document.querySelector('#upload-box')!
  uploadBox.addEventListener('dragover', (event) => { event.preventDefault(); uploadBox.classList.add('dragging') })
  uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragging'))
  uploadBox.addEventListener('drop', async (event) => {
    event.preventDefault()
    uploadBox.classList.remove('dragging')
    const file = (event as DragEvent).dataTransfer?.files[0]
    if (!file) return
    try { await loadDataset(file) } catch (error) { document.querySelector('#dataset-message')!.textContent = error instanceof Error ? error.message : 'Unable to read this dataset.' }
  })
  document.querySelector<HTMLInputElement>('#dataset-upload')!.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    try { await loadDataset(file) } catch (error) { document.querySelector('#dataset-message')!.textContent = error instanceof Error ? error.message : 'Unable to read this dataset.' }
  })
}
