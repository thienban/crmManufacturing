'use client'

import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CSS } from '@dnd-kit/utilities'

interface KanbanCardProps {
    project: {
        id: string
        title: string
        status: string
        deadline?: string | null
        value?: number | null
    }
}

export function KanbanCard({ project }: KanbanCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: project.id,
        data: project,
    })

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab touch-none">
            <Card className="mb-2 hover:shadow-md transition-shadow">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium leading-none">
                        {project.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center mt-2">
                            <span>{project.value ? `$${project.value}` : '-'}</span>
                            {project.deadline && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    {new Date(project.deadline).toLocaleDateString()}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
