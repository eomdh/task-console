import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../api/get-dashboard'

export function useDashboardQuery() {
  return useQuery({ queryKey: ['dashboard'], queryFn: getDashboard })
}
