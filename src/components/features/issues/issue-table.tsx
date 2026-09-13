import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import type { IssueRecord } from '@/types/issue'

type IssueTableProps = {
  issues: IssueRecord[]
  loading: boolean
  onEdit: (issue: IssueRecord) => void
  onDelete: (id: number) => void
}

export function IssueTable({ issues, loading, onEdit, onDelete }: IssueTableProps) {
  if (loading) return <p className="py-8 text-center text-sm text-[#8b9bb8]">Loading issues...</p>
  if (!issues.length) return <p className="py-8 text-center text-sm text-[#8b9bb8]">No issues yet. Click Add Issue to create one.</p>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[#243049] text-left text-xs uppercase text-[#8b9bb8]">
            <th className="pb-3 pr-4">ID</th>
            <th className="pb-3 pr-4">Severity</th>
            <th className="pb-3 pr-4">Rule</th>
            <th className="pb-3 pr-4">Principle</th>
            <th className="pb-3 pr-4">Record / Field</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.id} className="border-b border-[#243049]/50 transition-colors hover:bg-[#151d32]">
              <td className="py-3 pr-4 text-[#c8d2e8]">{issue.id}</td>
              <td className="py-3 pr-4">
                <Tag tone={issue.severity === 'Critical' ? 'critical' : issue.severity === 'Warning' ? 'warning' : 'info'}>{issue.severity}</Tag>
              </td>
              <td className="py-3 pr-4 text-[#c8d2e8]">{issue.rule}</td>
              <td className="py-3 pr-4 capitalize text-[#c8d2e8]">{issue.principle}</td>
              <td className="py-3 pr-4"><div className="text-[#c8d2e8]">{issue.record}</div><div className="text-xs text-violet-300">{issue.field}</div></td>
              <td className="py-3 pr-4 text-[#c8d2e8]">{issue.status}</td>
              <td className="py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onEdit(issue)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(issue.id)}>Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
