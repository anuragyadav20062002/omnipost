import { DashboardData } from "./DashboardData"
import { DashboardSidebar } from "./DashboardSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const data = await DashboardData()

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar data={data} />
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

