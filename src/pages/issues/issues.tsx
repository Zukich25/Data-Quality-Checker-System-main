import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  createIssue,
  deleteIssue,
  getIssues,
  updateIssue,
} from '@/api/issuesApi'
import { cn } from '@/lib/cn'
import type { IssueFormData, IssueRecord } from '@/types/issue'
import { emptyIssueForm } from '@/types/issue'

export default function IssuesPage() {
  const [issues, setIssues] = useState<IssueRecord[]>([])
  const [form, setForm] = useState<IssueFormData>(emptyIssueForm())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const loadIssues = async () => {
    setLoading(true)
    setError('')

    try {
      setIssues(await getIssues())
    } catch {
      setError('Could not load issues. Start Apache + MySQL in Xampp and import backend/database/schema.sql.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    getIssues()
      .then((data) => {
        if (active) setIssues(data)
      })
      .catch(() => {
        if (active) {
          setError('Could not load issues. Start Apache + MySQL in Xampp and import backend/database/schema.sql.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const resetForm = () => {
    setForm(emptyIssueForm())
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingId) {
        await updateIssue(editingId, form)
      } else {
        await createIssue(form)
      }

      resetForm()
      await loadIssues()
    } catch {
      setError('Save failed. Check that MySQL is running and the database is set up.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (issue: IssueRecord) => {
    setEditingId(issue.id)
    setForm({
      severity: issue.severity,
      rule: issue.rule,
      principle: issue.principle,
      record: issue.record,
      field: issue.field,
      detail: issue.detail,
      fix: issue.fix,
      status: issue.status,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this issue?')) return

    setError('')

    try {
      await deleteIssue(id)
      await loadIssues()
    } catch {
      setError('Delete failed.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] px-4 py-8 text-[#26363a]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#90a09e]">CRUD Module</p>
            <h1 className="text-3xl font-bold text-[#26363a]">Data Quality Issues</h1>
            <p className="mt-1 text-sm text-[#7a8989]">React + Axios frontend, PHP + MySQL backend</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="rounded-md border border-[#e2e9e6] bg-white px-4 py-2 text-sm font-medium hover:border-[#137966]"
            >
              Back to Checker
            </Link>
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(emptyIssueForm())
                setShowForm(true)
              }}
              className="rounded-md bg-[#137966] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f5c4d]"
            >
              Add Issue
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-lg border border-[#e2e9e6] bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-semibold">
              {editingId ? 'Update Issue' : 'Create Issue'}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span>Severity</span>
                <select
                  value={form.severity}
                  onChange={(event) => setForm({ ...form, severity: event.target.value as IssueFormData['severity'] })}
                  className="rounded-md border border-[#e2e9e6] px-3 py-2"
                >
                  <option value="Critical">Critical</option>
                  <option value="Warning">Warning</option>
                  <option value="Info">Info</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as IssueFormData['status'] })}
                  className="rounded-md border border-[#e2e9e6] px-3 py-2"
                >
                  <option value="Open">Open</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span>Rule</span>
                <input
                  value={form.rule}
                  onChange={(event) => setForm({ ...form, rule: event.target.value })}
                  required
                  className="rounded-md border border-[#e2e9e6] px-3 py-2"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span>Principle</span>
                <select
                  value={form.principle}
                  onChange={(event) => setForm({ ...form, principle: event.target.value as IssueFormData['principle'] })}
                  className="rounded-md border border-[#e2e9e6] px-3 py-2"
                >
                  <option value="accuracy">Accuracy</option>
                  <option value="consistency">Consistency</option>
                  <option value="completeness">Completeness</option>
                  <option value="timeliness">Timeliness</option>
                  <option value="reliability">Reliability</option>
                  <option value="relevance">Relevance</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span>Record</span>
                <input
                  value={form.record}
                  onChange={(event) => setForm({ ...form, record: event.target.value })}
                  required
                  className="rounded-md border border-[#e2e9e6] px-3 py-2"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span>Field</span>
                <input
                  value={form.field}
                  onChange={(event) => setForm({ ...form, field: event.target.value })}
                  required
                  className="rounded-md border border-[#e2e9e6] px-3 py-2"
                />
              </label>

              <label className="grid gap-1 text-sm md:col-span-2">
                <span>Detail</span>
                <textarea
                  value={form.detail}
                  onChange={(event) => setForm({ ...form, detail: event.target.value })}
                  required
                  rows={2}
                  className="rounded-md border border-[#e2e9e6] px-3 py-2"
                />
              </label>

              <label className="grid gap-1 text-sm md:col-span-2">
                <span>Proposed Fix</span>
                <textarea
                  value={form.fix}
                  onChange={(event) => setForm({ ...form, fix: event.target.value })}
                  required
                  rows={2}
                  className="rounded-md border border-[#e2e9e6] px-3 py-2"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#137966] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f5c4d] disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-[#e2e9e6] bg-white px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-lg border border-[#e2e9e6] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#fafcfb] text-left text-xs uppercase tracking-wide text-[#96a29f]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Rule</th>
                  <th className="px-4 py-3">Principle</th>
                  <th className="px-4 py-3">Record / Field</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#7a8989]">
                      Loading issues...
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#7a8989]">
                      No issues yet. Click Add Issue to create one.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.id} className="border-t border-[#edf1ef]">
                      <td className="px-4 py-3">{issue.id}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'rounded px-2 py-1 text-xs font-semibold',
                            issue.severity === 'Critical' && 'bg-[#fce8e4] text-[#c75142]',
                            issue.severity === 'Warning' && 'bg-[#fff2dd] text-[#b8812e]',
                            issue.severity === 'Info' && 'bg-[#e8f1f9] text-[#5381a5]',
                          )}
                        >
                          {issue.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">{issue.rule}</td>
                      <td className="px-4 py-3 capitalize">{issue.principle}</td>
                      <td className="px-4 py-3">
                        <div>{issue.record}</div>
                        <div className="text-xs text-[#13816d]">{issue.field}</div>
                      </td>
                      <td className="px-4 py-3">{issue.status}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(issue)}
                            className="rounded border border-[#e2e9e6] px-2 py-1 text-xs hover:border-[#137966]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(issue.id)}
                            className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
