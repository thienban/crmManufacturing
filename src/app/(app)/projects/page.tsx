import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Button } from '@/components/ui/button'
import { CreateProjectSheet } from '@/components/projects/CreateProjectSheet'
import { CalendarView } from '@/components/projects/CalendarView'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
            <Tabs defaultValue="kanban" className="flex-1 flex flex-col overflow-hidden">
                <TabsList>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                <TabsContent value="kanban" className="flex-1 overflow-hidden mt-4">
                    <KanbanBoard />
                </TabsContent>
                <TabsContent value="calendar" className="flex-1 overflow-y-auto mt-4">
                    <CalendarView />
                </TabsContent>
            </Tabs>
        </div>
    )
}
