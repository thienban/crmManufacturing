'use client'

import { trpc } from '@/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO, startOfWeek, endOfWeek, addDays, getDay } from 'date-fns'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const { data: projects, isLoading: projectsLoading } = trpc.projects.getAll.useQuery()
    const { data: orders, isLoading: ordersLoading } = trpc.production.getAll.useQuery()

    const isLoading = projectsLoading || ordersLoading

    // Calendar logic
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    // Generate all days to display (including padding days)
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    const resetToday = () => setCurrentDate(new Date())

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-muted-foreground">Track Projects and Production schedules.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={resetToday}>Today</Button>
                    <div className="flex items-center rounded-md border text-card-foreground shadow-sm">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="px-2">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="w-[150px] text-center font-medium">
                            {format(currentDate, 'MMMM yyyy')}
                        </div>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="px-2">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border border-muted shadow-sm">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="bg-background p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}

                {days.map((day, dayIdx) => {
                    // Filter events for this day
                    const dayProjects = projects?.filter(p => p.deadline && isSameDay(parseISO(p.deadline), day)) || []
                    const dayOrders = orders?.filter(o => o.expectedDelivery && isSameDay(parseISO(o.expectedDelivery), day)) || []

                    const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                    const isToday = isSameDay(day, new Date())

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "bg-background min-h-[120px] p-2 transition-colors hover:bg-muted/30 flex flex-col gap-1",
                                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                            )}
                        >
                            <div className={cn(
                                "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full mb-1",
                                isToday && "bg-primary text-primary-foreground"
                            )}>
                                {format(day, 'd')}
                            </div>

                            <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px]">
                                {dayProjects.map(p => (
                                    <Link key={p.id} href={`/projects/${p.id}`}>
                                        <div className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 truncate cursor-pointer hover:opacity-80">
                                            Prj: {p.title}
                                        </div>
                                    </Link>
                                ))}
                                {dayOrders.map(o => (
                                    <Link key={o.id} href={`/production/orders/${o.id}`}>
                                        <div className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800 truncate cursor-pointer hover:opacity-80">
                                            Ord: {typeof o.supplier === 'object' ? (o.supplier as any).name : 'Supplier'}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded"></div>
                    <span>Projects (Deadline)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded"></div>
                    <span>Production Orders (Expected Delivery)</span>
                </div>
            </div>
        </div>
    )
}
