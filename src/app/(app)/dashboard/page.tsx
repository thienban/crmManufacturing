import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart'
import { MissingStockList } from '@/components/dashboard/MissingStockList'

export default function DashboardPage() {
    return (
        <div className="container mx-auto py-10 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of project statuses and inventory alerts.
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Project Status</h3>
                <ProjectStatusChart />
            </div>

            <div className="space-y-4">
                <MissingStockList />
            </div>
        </div>
    )
}
