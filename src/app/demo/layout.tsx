import DemoSidebar from '@/components/demo/DemoSidebar'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoSidebar variant="demo">{children}</DemoSidebar>
}
