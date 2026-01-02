'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
    id: string
    title: string
    projects: any[]
}

export function KanbanColumn({ id, title, projects }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    })

    return (
        <div className="flex w-72 flex-col rounded-lg bg-secondary/50 p-2">
            <h3 className="mb-2 px-2 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                {title} <span className="text-xs font-normal">({projects.length})</span>
            </h3>
            <div
                ref={setNodeRef}
                className={cn(
                    'flex flex-1 flex-col gap-2 rounded-md p-1 transition-colors min-h-[150px]',
                    isOver && 'bg-primary/10'
                )}
            >
                {projects.map((project) => (
                    <KanbanCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    )
}
