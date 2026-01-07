'use client'

import { trpc } from '@/trpc/client'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, ArrowLeft, Calendar, DollarSign, User, Factory, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EditItemsSheet } from '@/components/projects/EditItemsSheet'
import { useState } from 'react'


export default function ProjectDetailPage() {
    const params = useParams()
    const projectId = params.id as string
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [itemsSheetOpen, setItemsSheetOpen] = useState(false)

    const { data: project, isLoading } = trpc.projects.getById.useQuery({ id: projectId })
    const { data: customers } = trpc.customers.getAll.useQuery()
    const utils = trpc.useUtils()

    const updateMutation = trpc.projects.update.useMutation({
        onSuccess: () => {
            utils.projects.getById.invalidate({ id: projectId })
            setOpen(false)
        },
    })

    const [formData, setFormData] = useState<{
        title: string
        customer: string
        status: 'lead' | 'discovery' | 'proposal' | 'production' | 'delivery' | 'completed'
        deadline: string
        value: number | ''
    }>({
        title: '',
        customer: '',
        status: 'lead',
        deadline: '',
        value: 0,
    })

    const handleEdit = () => {
        if (project) {
            const customerId = typeof project.customer === 'object' && project.customer !== null
                ? (project.customer as any).id
                : project.customer

            setFormData({
                title: project.title || '',
                customer: customerId || '',
                status: (project.status as any) || 'lead',
                deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
                value: project.value || 0,
            })
            setOpen(true)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({
            id: projectId,
            ...formData,
            status: formData.status as any,
            value: Number(formData.value) || 0,
            deadline: formData.deadline || undefined,
        })
    }

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
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Project</DialogTitle>
                                <DialogDescription>
                                    Update project information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="customer">Customer *</Label>
                                    <Select value={formData.customer} onValueChange={(value) => setFormData({ ...formData, customer: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers?.map((customer: any) => (
                                                <SelectItem key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lead">Lead</SelectItem>
                                            <SelectItem value="discovery">Discovery</SelectItem>
                                            <SelectItem value="proposal">Proposal</SelectItem>
                                            <SelectItem value="production">In Production</SelectItem>
                                            <SelectItem value="delivery">Delivery</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="deadline">Deadline</Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="value">Project Value</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setFormData({ ...formData, value: val === '' ? '' : parseFloat(val) })
                                        }}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="quotation">Quotation</TabsTrigger>
                    <TabsTrigger value="production">Production</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{typeof project.description === 'string' ? project.description : 'Description content (Rich Text)'}</p>
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

                <TabsContent value="quotation">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Quotation</CardTitle>
                                <CardDescription>
                                    Add price and quantity for each item.
                                </CardDescription>
                            </div>
                            <Button onClick={() => setItemsSheetOpen(true)} size="sm" variant="outline">
                                <Pencil className="mr-2 h-4 w-4" />
                                Manage Quotation
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {project.items && project.items.length > 0 ? (
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="p-3 text-left font-medium">Item</th>
                                                <th className="p-3 text-right font-medium">Quantity</th>
                                                <th className="p-3 text-right font-medium">Price</th>
                                                <th className="p-3 text-right font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.items.map((item: any, i: number) => (
                                                <tr key={item.id || i} className="border-b last:border-0 hover:bg-muted/5">
                                                    <td className="p-3">
                                                        <div className="font-medium">{item.name}</div>
                                                        {item.description && (
                                                            <div className="text-xs text-muted-foreground">{item.description}</div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right">{item.quantity}</td>
                                                    <td className="p-3 text-right">${item.price?.toLocaleString()}</td>
                                                    <td className="p-3 text-right pl-6 font-medium">
                                                        ${((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-muted/50 font-bold">
                                                <td className="p-3" colSpan={3}>Total Value</td>
                                                <td className="p-3 text-right">
                                                    ${project.items.reduce((acc: number, item: any) => acc + ((item.quantity || 0) * (item.price || 0)), 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                    <p className="mb-2">No items added to this project yet.</p>
                                    <Button onClick={() => setItemsSheetOpen(true)} variant="outline">
                                        Add First Item
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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

            <EditItemsSheet
                open={itemsSheetOpen}
                onOpenChange={setItemsSheetOpen}
                projectId={projectId}
                initialItems={project.items || []}
            />
        </div>
    )
}
