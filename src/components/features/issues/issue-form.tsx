import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { IssueFormData } from '@/types/issue'

type IssueFormProps = {
  form: IssueFormData
  saving: boolean
  editing: boolean
  onChange: (form: IssueFormData) => void
  onSubmit: (event: React.FormEvent) => void
  onCancel: () => void
}

export function IssueForm({ form, saving, editing, onChange, onSubmit, onCancel }: IssueFormProps) {
  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1"><Label>Severity</Label>
        <select value={form.severity} onChange={(e) => onChange({ ...form, severity: e.target.value as IssueFormData['severity'] })} className="w-full rounded-lg border border-[#243049] bg-[#0a1020] px-3 py-2 text-sm text-white">
          <option value="Critical">Critical</option><option value="Warning">Warning</option><option value="Info">Info</option>
        </select>
      </div>
      <div className="space-y-1"><Label>Status</Label>
        <select value={form.status} onChange={(e) => onChange({ ...form, status: e.target.value as IssueFormData['status'] })} className="w-full rounded-lg border border-[#243049] bg-[#0a1020] px-3 py-2 text-sm text-white">
          <option value="Open">Open</option><option value="Resolved">Resolved</option>
        </select>
      </div>
      <div className="space-y-1"><Label>Rule</Label><Input value={form.rule} onChange={(e) => onChange({ ...form, rule: e.target.value })} required /></div>
      <div className="space-y-1"><Label>Principle</Label>
        <select value={form.principle} onChange={(e) => onChange({ ...form, principle: e.target.value as IssueFormData['principle'] })} className="w-full rounded-lg border border-[#243049] bg-[#0a1020] px-3 py-2 text-sm text-white">
          {['accuracy', 'consistency', 'completeness', 'timeliness', 'reliability', 'relevance'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="space-y-1"><Label>Record</Label><Input value={form.record} onChange={(e) => onChange({ ...form, record: e.target.value })} required /></div>
      <div className="space-y-1"><Label>Field</Label><Input value={form.field} onChange={(e) => onChange({ ...form, field: e.target.value })} required /></div>
      <div className="space-y-1 md:col-span-2"><Label>Detail</Label><Textarea value={form.detail} onChange={(e) => onChange({ ...form, detail: e.target.value })} required rows={2} /></div>
      <div className="space-y-1 md:col-span-2"><Label>Proposed Fix</Label><Textarea value={form.fix} onChange={(e) => onChange({ ...form, fix: e.target.value })} required rows={2} /></div>
      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Issue' : 'Create Issue'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
