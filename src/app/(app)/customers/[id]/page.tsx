'use client'

import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

export default function CustomerDetailPage() {
    const params = useParams()
    const customerId = params.id as string
    const [open, setOpen] = useState(false)

    const { data: customer, isLoading } = trpc.customers.getById.useQuery({ id: customerId })
    const utils = trpc.useUtils()

    const updateMutation = trpc.customers.update.useMutation({
        onSuccess: () => {
            utils.customers.getById.invalidate({ id: customerId })
            setOpen(false)
        },
    })

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        contactPerson: '',
        address: '',
        status: '' as 'active' | 'inactive' | 'pending',
        type: '' as 'customer' | 'prospect',
    })

    const handleEdit = () => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                contactPerson: customer.contactPerson || '',
                address: customer.address || '',
                status: customer.status || 'active',
                type: customer.type || 'prospect',
            })
            setOpen(true)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({
            id: customerId,
            data: formData,
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <h2 className="text-xl font-semibold">Customer not found</h2>
                <Button asChild>
                    <Link href="/customers">Back to Customers</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/customers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                        <p className="text-muted-foreground">{customer.type === 'customer' ? 'Customer' : 'Prospect'}</p>
                    </div>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Customer</DialogTitle>
                                <DialogDescription>
                                    Update customer information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Company / Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="contactPerson">Contact Person</Label>
                                        <Input
                                            id="contactPerson"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="customer">Customer</SelectItem>
                                                <SelectItem value="prospect">Prospect</SelectItem>
                                            </SelectContent>
                                        </Select>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Email</span>
                            <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Phone</span>
                            <span className="text-sm">{customer.phone || '-'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Contact Person</span>
                            <span className="text-sm">{customer.contactPerson || '-'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Address</span>
                            <span className="text-sm">{customer.address || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                                {customer.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
