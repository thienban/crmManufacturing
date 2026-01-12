'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/trpc/client'
import { FolderKanban, FileText, Settings, Truck, CheckCircle, Package } from 'lucide-react'

const icons = {
    lead: FolderKanban,
    discovery: FileText,
    proposal: FileText, // Reusing for now
    production: Settings,
    delivery: Truck,
    completed: CheckCircle,
}

const labels = {
    lead: 'Lead',
    discovery: 'Discovery',
    proposal: 'Proposal',
    production: 'In Production',
    delivery: 'Delivery',
    completed: 'Completed',
}

export function ProjectStatusChart() {
    const { data: stats, isLoading } = trpc.dashboard.getStats.useQuery()

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Loading stats...</div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats?.map((stat) => {
                const Icon = icons[stat.status as keyof typeof icons] || Package
                return (
                    <Card key={stat.status}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {labels[stat.status as keyof typeof labels] || stat.status}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.count}</div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
