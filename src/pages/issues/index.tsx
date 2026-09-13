import { useEffect, useState } from 'react'
import { createIssue, deleteIssue, getIssues, updateIssue } from '@/api/issuesApi'
import { AppLayout } from '@/components/common/app-layout'
import { IssueForm } from '@/components/features/issues/issue-form'
import { IssueTable } from '@/components/features/issues/issue-table'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
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
      setError('Could not load issues. Run docker compose up -d and wait for MySQL.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    getIssues()
      .then((data) => { if (active) setIssues(data) })
      .catch(() => { if (active) setError('Could not load issues. Run docker compose up -d and wait for MySQL.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
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
      if (editingId) await updateIssue(editingId, form)
      else await createIssue(form)
      resetForm()
      await loadIssues()
    } catch {
      setError('Save failed. Check Docker containers are running.')
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
    <AppLayout>
      <Section
        title="Issues"
        description="Manage data quality issues"
        action={
          <Button onClick={() => { setEditingId(null); setForm(emptyIssueForm()); setShowForm(true) }}>
            Add Issue
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 animate-fade-in">{error}</div>
      )}

      {showForm && (
        <Card className="mb-6 animate-fade-in-up">
          <CardHeader>
            <h3 className="font-semibold text-white">{editingId ? 'Update Issue' : 'Create Issue'}</h3>
          </CardHeader>
          <CardBody>
            <IssueForm
              form={form}
              saving={saving}
              editing={!!editingId}
              onChange={setForm}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          </CardBody>
        </Card>
      )}

      <Card className="animate-fade-in-up stagger-1">
        <CardBody>
          <IssueTable issues={issues} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        </CardBody>
      </Card>
    </AppLayout>
  )
}
