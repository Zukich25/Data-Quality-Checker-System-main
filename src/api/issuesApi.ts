import api from '@/lib/axios'
import type { IssueFormData, IssueRecord, IssueResponse, IssuesResponse } from '@/types/issue'

export async function getIssues(): Promise<IssueRecord[]> {
  const { data } = await api.get<IssuesResponse>('/issues.php')
  return data.data
}

export async function getIssue(id: number): Promise<IssueRecord> {
  const { data } = await api.get<IssueResponse>(`/issues.php?id=${id}`)
  return data.data
}

export async function createIssue(payload: IssueFormData): Promise<IssueRecord> {
  const { data } = await api.post<IssueResponse>('/issues.php', payload)
  return data.data
}

export async function updateIssue(id: number, payload: IssueFormData): Promise<IssueRecord> {
  const { data } = await api.put<IssueResponse>(`/issues.php?id=${id}`, payload)
  return data.data
}

export async function deleteIssue(id: number): Promise<void> {
  await api.delete(`/issues.php?id=${id}`)
}
