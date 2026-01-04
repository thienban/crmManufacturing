import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Button } from '@/components/ui/button'
import { CreateProjectSheet } from '@/components/projects/CreateProjectSheet'

import { Plus } from 'lucide-react'

export default function ProjectsPage() {
    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your projects.</p>
                </div>
                <CreateProjectSheet />
            </div>
            <div className="flex-1 overflow-hidden mt-4">
                <KanbanBoard />
            </div>
        </div>
    )
}
