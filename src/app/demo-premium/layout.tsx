import DemoSidebar from '@/components/demo/DemoSidebar'

export default function DemoPremiumLayout({ children }: { children: React.ReactNode }) {
  return <DemoSidebar variant="premium">{children}</DemoSidebar>
}
