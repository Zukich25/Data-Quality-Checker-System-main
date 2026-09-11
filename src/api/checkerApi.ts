import api from '@/lib/axios'
import type {
  CheckDatasetRequest,
  CheckDatasetResponse,
  HealthResponse,
} from '@/types/checker'

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>('/health.php')
  return data
}

export async function checkDataset(
  payload: CheckDatasetRequest,
): Promise<CheckDatasetResponse['data']> {
  const { data } = await api.post<CheckDatasetResponse>(
    '/check-dataset.php',
    payload,
  )

  if (!data.success) {
    throw new Error('Dataset check failed')
  }

  return data.data
}
