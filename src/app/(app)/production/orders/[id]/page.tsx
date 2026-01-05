'use client'

import { trpc } from '@/trpc/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Truck, Calendar, Box, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export default function ProductionOrderDetailPage() {
    const params = useParams()
    const orderId = params.id as string
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const { data: order, isLoading } = trpc.production.getOrderById.useQuery({ id: orderId })
    const { data: projects } = trpc.projects.getAll.useQuery()
    const { data: suppliers } = trpc.suppliers.getAll.useQuery()
    const utils = trpc.useUtils()

    const updateMutation = trpc.production.update.useMutation({
        onSuccess: () => {
            utils.production.getOrderById.invalidate({ id: orderId })
            setOpen(false)
        },
    })

    const [formData, setFormData] = useState<{
        project: string
        supplier: string
        status: 'draft' | 'sent' | 'in_production' | 'shipped' | 'received'
        expectedDelivery: string
        items: Array<{ name: string; description: string; quantity: number | ''; price: number | '' }>
    }>({
        project: '',
        supplier: '',
        status: 'draft',
        expectedDelivery: '',
        items: [],
    })

    const handleEdit = () => {
        if (order) {
            const projectId = typeof order.project === 'object' && order.project !== null
                ? (order.project as any).id
                : order.project

            const supplierId = typeof order.supplier === 'object' && order.supplier !== null
                ? (order.supplier as any).id
                : order.supplier

            setFormData({
                project: projectId || '',
                supplier: supplierId || '',
                status: (order.status as any) || 'draft',
                expectedDelivery: order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : '',
                items: (order.items || []).map(item => ({
                    name: item.name,
                    description: item.description || '',
                    quantity: item.quantity,
                    price: item.price,
                })),
            })
            setOpen(true)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({
            id: orderId,
            ...formData,
            status: formData.status as any,
            items: formData.items.map(item => ({
                ...item,
                quantity: Number(item.quantity) || 0,
                price: Number(item.price) || 0,
            })),
            expectedDelivery: formData.expectedDelivery || undefined,
        })
    }

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', description: '', quantity: 1, price: 0 }],
        })
    }

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        })
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items]
        // @ts-ignore
        newItems[index] = { ...newItems[index], [field]: value }
        setFormData({ ...formData, items: newItems })
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <h2 className="text-xl font-semibold">Order not found</h2>
                <Button variant="outline" onClick={() => router.push('/production')}>
                    Back to Production
                </Button>
            </div>
        )
    }

    // Safely handle relations
    const supplierName = typeof order.supplier === 'object' && order.supplier !== null
        ? (order.supplier as any).name
        : 'Unknown Supplier'

    const projectName = typeof order.project === 'object' && order.project !== null
        ? (order.project as any).title
        : 'Unknown Project'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/production">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(-6)}</h1>
                            <Badge variant={order.status === 'received' ? 'default' : 'secondary'}>
                                {order.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            For Project: <span className="font-medium text-foreground">{projectName}</span>
                        </p>
                    </div>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Order
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Production Order</DialogTitle>
                                <DialogDescription>
                                    Update order information and items
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="project">Project *</Label>
                                    <Select value={formData.project} onValueChange={(value) => setFormData({ ...formData, project: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select project" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects?.map((project: any) => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="supplier">Supplier *</Label>
                                    <Select value={formData.supplier} onValueChange={(value) => setFormData({ ...formData, supplier: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select supplier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers?.map((supplier: any) => (
                                                <SelectItem key={supplier.id} value={supplier.id}>
                                                    {supplier.name}
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
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="sent">Sent to Supplier</SelectItem>
                                            <SelectItem value="in_production">In Production</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="received">Received</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                                    <Input
                                        id="expectedDelivery"
                                        type="date"
                                        value={formData.expectedDelivery}
                                        onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                                    />
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <Label>Order Items</Label>
                                        <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Item
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="border rounded-lg p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Item {index + 1}</span>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-xs">Name *</Label>
                                                        <Input
                                                            value={item.name}
                                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Description</Label>
                                                        <Input
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Quantity *</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = e.target.value
                                                                updateItem(index, 'quantity', val === '' ? '' : parseInt(val))
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Price *</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={item.price}
                                                            onChange={(e) => {
                                                                const val = e.target.value
                                                                updateItem(index, 'price', val === '' ? '' : parseFloat(val))
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {formData.items.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                No items added. Click &quot;Add Item&quot; to add items to this order.
                                            </p>
                                        )}
                                    </div>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.items && order.items.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.name || 'Item'}</TableCell>
                                                <TableCell>{item.description || '-'}</TableCell>
                                                <TableCell className="text-right">{item.quantity || 1}</TableCell>
                                                <TableCell className="text-right">${item.price || 0}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${((item.quantity || 1) * (item.price || 0)).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No items listed.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Truck className="mr-2 h-4 w-4" />
                                    Supplier
                                </div>
                                <span className="text-sm font-medium">{supplierName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Expected Delivery
                                </div>
                                <span className="text-sm font-medium">
                                    {order.expectedDelivery ? format(new Date(order.expectedDelivery), 'PPP') : '-'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
