'use client'

import { trpc } from '@/trpc/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ArrowLeft, Mail, Phone, User, Package } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function SupplierDetailPage() {
    const params = useParams()
    const supplierId = params.id as string
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const { data: supplier, isLoading } = trpc.suppliers.getById.useQuery({ id: supplierId })
    const utils = trpc.useUtils()

    const updateMutation = trpc.suppliers.update.useMutation({
        onSuccess: () => {
            utils.suppliers.getById.invalidate({ id: supplierId })
            setOpen(false)
        },
    })

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactPerson: '',
        phone: '',
    })

    const handleEdit = () => {
        if (supplier) {
            setFormData({
                name: supplier.name || '',
                email: supplier.email || '',
                contactPerson: supplier.contactPerson || '',
                phone: supplier.phone || '',
            })
            setOpen(true)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({
            id: supplierId,
            ...formData,
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!supplier) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <h2 className="text-xl font-semibold">Supplier not found</h2>
                <Button variant="outline" onClick={() => router.push('/production')}>
                    Back to Production
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/production?tab=suppliers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{supplier.name}</h1>
                        <p className="text-muted-foreground">Supplier ID: {supplier.id}</p>
                    </div>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleEdit}>
                            Edit Supplier
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Supplier</DialogTitle>
                                <DialogDescription>
                                    Update supplier information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
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
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                Contact Person
                            </div>
                            <span className="text-sm font-medium">{supplier.contactPerson || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                            </div>
                            <span className="text-sm font-medium">{supplier.email || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-2 h-4 w-4" />
                                Phone
                            </div>
                            <span className="text-sm font-medium">{supplier.phone || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Products / Services</CardTitle>
                        <CardDescription>
                            What this supplier provides.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* If `products` was a field, we'd map it here. Assuming it might be added later or is free text. */}
                        <div className="text-center py-6 text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No specific products listed.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
