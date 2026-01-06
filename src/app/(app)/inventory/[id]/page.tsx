'use client'

import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Calendar, AlertTriangle, Pencil, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'


function EditItemSheet({ item, open, onOpenChange }: { item: any, open: boolean, onOpenChange: (open: boolean) => void }) {
    const utils = trpc.useUtils()
    const [formData, setFormData] = useState({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit || 'pcs',
        minQuantity: item.minQuantity || 0,
        location: item.location || '',
    })

    const updateMutation = trpc.inventory.update.useMutation({
        onSuccess: () => {
            toast.success('Item updated successfully')
            utils.inventory.getById.invalidate({ id: item.id })
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error('Failed to update item')
            console.error(error)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateMutation.mutate({
            id: item.id,
            ...formData,
            quantity: Number(formData.quantity),
            minQuantity: Number(formData.minQuantity),
        })
    }

    return (
        <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
            <SheetHeader>
                <SheetTitle>Edit Inventory Item</SheetTitle>
                <SheetDescription>
                    Make changes to the inventory item here. Click save when you're done.
                </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                                id="unit"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="minQuantity">Min Quantity</Label>
                            <Input
                                id="minQuantity"
                                type="number"
                                min="0"
                                value={formData.minQuantity}
                                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </SheetContent>
    )
}


function RemoveStockSheet({ item, open, onOpenChange }: { item: any, open: boolean, onOpenChange: (open: boolean) => void }) {
    const utils = trpc.useUtils()
    const [formData, setFormData] = useState({
        quantity: 1,
        type: 'resell',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    })

    const removeMutation = trpc.inventory.removeStock.useMutation({
        onSuccess: () => {
            toast.success('Stock removed successfully')
            utils.inventory.getById.invalidate({ id: item.id })
            onOpenChange(false)
            setFormData({
                quantity: 1,
                type: 'resell',
                date: new Date().toISOString().split('T')[0],
                notes: '',
            })
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to remove stock')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        removeMutation.mutate({
            id: item.id,
            quantity: Number(formData.quantity),
            type: formData.type as 'resell' | 'manufactured' | 'adjustment',
            date: new Date(formData.date).toISOString(),
            notes: formData.notes,
        })
    }

    return (
        <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
            <SheetHeader>
                <SheetTitle>Remove Stock</SheetTitle>
                <SheetDescription>
                    Record items removed from inventory.
                </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Reason for Removal</Label>
                        <select
                            id="type"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="resell">Resell (Sold not transformed)</option>
                            <option value="manufactured">Manufactured (Used in production)</option>
                            <option value="adjustment">Adjustment (Correction/Loss)</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="remove-quantity">Quantity Removed</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="remove-quantity"
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                required
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                of {item.quantity} {item.unit || 'pcs'} available
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Optional details..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="submit" variant="destructive" disabled={removeMutation.isPending}>
                        {removeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Removal
                    </Button>
                </div>
            </form>
        </SheetContent>
    )
}

export default function InventoryItemPage() {
    const params = useParams()
    const id = params.id as string
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isRemoveOpen, setIsRemoveOpen] = useState(false)

    const { data: item, isLoading } = trpc.inventory.getById.useQuery({ id })

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">Item not found</h2>
                <Button asChild>
                    <Link href="/inventory">Back to Inventory</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/inventory">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{item.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Badge variant="outline">
                                {item.quantity <= (item.minQuantity || 0) ? 'Low Stock' : 'In Stock'}
                            </Badge>
                            {item.location && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {item.location}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Sheet open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
                        <SheetTrigger asChild>
                            <Button variant="destructive">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Remove Stock
                            </Button>
                        </SheetTrigger>
                        <RemoveStockSheet item={item} open={isRemoveOpen} onOpenChange={setIsRemoveOpen} />
                    </Sheet>

                    <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Item
                            </Button>
                        </SheetTrigger>
                        <EditItemSheet item={item} open={isEditOpen} onOpenChange={setIsEditOpen} />
                    </Sheet>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Details */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Item Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Description</h3>
                            <p className="text-sm">{item.description || 'No description provided.'}</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Unit Type</h3>
                                <p className="text-sm font-medium">{item.unit || 'Pieces (pcs)'}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Last Restocked</h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {item.lastRestocked
                                            ? new Date(item.lastRestocked).toLocaleDateString()
                                            : 'Never'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* Stock Information */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Level</CardTitle>
                            <CardDescription>Current inventory status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-6 bg-muted/20 rounded-lg border">
                                <span className="text-4xl font-bold">{item.quantity}</span>
                                <span className="text-muted-foreground text-sm">{item.unit || 'pcs'}</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Minimum Required</span>
                                    <span className="font-medium">{item.minQuantity || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={item.quantity <= (item.minQuantity || 0) ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                                        {item.quantity <= (item.minQuantity || 0) ? 'Restock Needed' : 'Good'}
                                    </span>
                                </div>
                            </div>

                            {item.quantity <= (item.minQuantity || 0) && (
                                <div className="bg-orange-50 text-orange-700 p-3 rounded-md text-sm flex gap-2 items-start border border-orange-100">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <p>Stock is below minimum level. Consider creating a purchase order.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stock History</CardTitle>
                            <CardDescription>Recent movements and removals</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {item.stockMovements && item.stockMovements.length > 0 ? (
                                <div className="space-y-4">
                                    {item.stockMovements.slice().reverse().map((move: any, i: number) => (
                                        <div key={i} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-medium capitalize">{move.type}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(move.date).toLocaleDateString()}
                                                </div>
                                                {move.notes && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        "{move.notes}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="font-bold text-red-600">
                                                -{move.quantity} {item.unit}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground py-4">
                                    No stock movements recorded yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
