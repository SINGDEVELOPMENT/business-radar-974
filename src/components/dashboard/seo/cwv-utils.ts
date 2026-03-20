export type CwvStatus = 'good' | 'needs-improvement' | 'poor'

export function cwvStatus(metric: 'lcp' | 'fcp' | 'cls' | 'tbt' | 'si', value: number): CwvStatus {
  if (metric === 'lcp') return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
  if (metric === 'fcp') return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
  if (metric === 'cls') return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
  if (metric === 'tbt') return value <= 200 ? 'good' : value <= 600 ? 'needs-improvement' : 'poor'
  if (metric === 'si') return value <= 3400 ? 'good' : value <= 5800 ? 'needs-improvement' : 'poor'
  return 'good'
}

export function statusColor(s: CwvStatus) {
  return s === 'good' ? 'text-emerald-600' : s === 'needs-improvement' ? 'text-orange-500' : 'text-red-500'
}

export function statusBg(s: CwvStatus) {
  return s === 'good' ? 'bg-emerald-50' : s === 'needs-improvement' ? 'bg-orange-50' : 'bg-red-50'
}

export function statusBadge(s: CwvStatus): 'success' | 'warning' | 'destructive' {
  return s === 'good' ? 'success' : s === 'needs-improvement' ? 'warning' : 'destructive'
}

export function statusLabel(s: CwvStatus) {
  return s === 'good' ? 'Bon' : s === 'needs-improvement' ? 'À améliorer' : 'Mauvais'
}
