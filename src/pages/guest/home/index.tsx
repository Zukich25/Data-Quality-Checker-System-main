import { AppLayout } from '@/components/common/app-layout'
import { CheckerDashboard } from '@/components/features/checker/checker-dashboard'

export default function HomePage() {
  return (
    <AppLayout>
      <CheckerDashboard />
    </AppLayout>
  )
}
