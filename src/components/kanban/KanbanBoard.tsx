'use client'

import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { trpc } from '@/trpc/client'
import { KanbanColumn } from './KanbanColumn'
import { LoadingSpinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

const COLUMNS = [
    { id: 'lead', title: 'Lead' },
    { id: 'discovery', title: 'Discovery' },
    { id: 'proposal', title: 'Proposal' },
    { id: 'production', title: 'In Production' },
    { id: 'delivery', title: 'Delivery' },
    { id: 'completed', title: 'Completed' },
]

export function KanbanBoard() {
    const { data: projects, isLoading, refetch } = trpc.projects.getAll.useQuery()
    const updateStatus = trpc.projects.updateStatus.useMutation({
        onSuccess: () => {
            refetch()
            toast.success('Project status updated')
        },
        onError: (err) => {
            toast.error('Failed to update status')
        }
    })

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over && active.id !== over.id) {
            // We assume over.id is the column id (status)
            const projectId = active.id as string
            const newStatus = over.id as any

            // Optimistic update could go here, but for now simple refetch
            updateStatus.mutate({ id: projectId, status: newStatus })
        }
    }

    if (isLoading) return <div>Loading...</div>

    // Group projects by status
    const projectsByStatus = COLUMNS.reduce((acc, col) => {
        acc[col.id] = projects?.filter((p) => p.status === col.id) || []
        return acc
    }, {} as Record<string, any[]>)

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        projects={projectsByStatus[col.id]}
                    />
                ))}
            </div>
        </DndContext>
    )
}
