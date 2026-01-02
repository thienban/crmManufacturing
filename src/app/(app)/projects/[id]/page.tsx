'use client'

import { trpc } from '@/trpc/client'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ArrowLeft, Calendar, DollarSign, User, Factory } from 'lucide-react'
import { format } from 'date-fns'

export default function ProjectDetailPage() {
    const params = useParams()
    const projectId = params.id as string
    const router = useRouter()

    const { data: project, isLoading } = trpc.projects.getById.useQuery({ id: projectId })

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <h2 className="text-xl font-semibold">Project not found</h2>
                <Button variant="outline" onClick={() => router.push('/projects')}>
                    Back to Projects
                </Button>
            </div>
        )
    }

    // Safely handle customer relation which could be a string ID or an object
    const customerName = typeof project.customer === 'object' && project.customer !== null
        ? (project.customer as any).name
        : 'Unknown Customer'

    const customerId = typeof project.customer === 'object' && project.customer !== null
        ? (project.customer as any).id
        : project.customer

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/projects">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Project ID: {project.id}
                        </p>
                    </div>
                </div>
                {/* Actions like Edit could go here */}
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="production">Production</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{project.description || 'No description provided.'}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <User className="mr-2 h-4 w-4" />
                                        Customer
                                    </div>
                                    <Link href={`/customers/${customerId}`} className="text-sm font-medium hover:underline">
                                        {customerName}
                                    </Link>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Deadline
                                    </div>
                                    <span className="text-sm font-medium">
                                        {project.deadline ? format(new Date(project.deadline), 'PPP') : '-'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Value
                                    </div>
                                    <span className="text-sm font-medium">
                                        {project.value ? `$${project.value.toLocaleString()}` : '-'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="production">
                    <Card>
                        <CardHeader>
                            <CardTitle>Production Orders</CardTitle>
                            <CardDescription>
                                Orders linked to this project.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                <Factory className="h-10 w-10 mb-4 opacity-50" />
                                <p>No production orders found (Feature coming soon).</p>
                                <Button variant="link" className="mt-2">
                                    Create Order
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
