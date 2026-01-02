'use client'

import { trpc } from '@/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const { data: projects } = trpc.projects.getAll.useQuery()

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-medium text-sm text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
                {days.map((day) => {
                    const dayProjects = projects?.filter(p => p.deadline && isSameDay(parseISO(p.deadline), day))
                    return (
                        <Card key={day.toISOString()} className="min-h-[100px] border-secondary">
                            <CardHeader className="p-2">
                                <CardTitle className="text-xs font-normal text-muted-foreground">
                                    {format(day, 'd')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 pt-0 space-y-1">
                                {dayProjects?.map(p => (
                                    <div key={p.id} className="text-[10px] bg-primary/10 p-1 rounded font-medium truncate" title={p.title}>
                                        {p.title}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
