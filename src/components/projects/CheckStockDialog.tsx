'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/trpc/client'
import { Loader2, ShoppingCart, ExternalLink } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner is used, or alert
import Link from 'next/link'

interface CheckStockDialogProps {
    items: any[]
    projectId: string
}

export function CheckStockDialog({ items, projectId }: CheckStockDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [selectedSupplier, setSelectedSupplier] = useState<string>('')
    const [orderItems, setOrderItems] = useState<{ name: string; quantity: number }[]>([])
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    const utils = trpc.useUtils()

    // Queries
    const { data: stockStatus, isLoading: isLoadingStock, refetch: refetchStock } =
        trpc.inventory.checkStockAvailability.useQuery(
            { items: items.map(i => ({ name: i.name, quantity: i.quantity || 0 })) },
            { enabled: open }
        )

    const { data: suppliers } = trpc.suppliers.getAll.useQuery(undefined, { enabled: open })

    // Mutations
    const createOrderMutation = trpc.production.create.useMutation({
        onSuccess: () => {
            toast.success('Production order created successfully')
            setOpen(false)
            setStep(1) // Reset step
            utils.production.getAll.invalidate()
            // Ideally navigate to the order or show a link
        },
        onError: (error) => {
            console.error(error)
            toast.error('Failed to create order')
        }
    })

    // Initialize order items when stock status loads or step changes
    useEffect(() => {
        if (stockStatus && open) {
            // Calculate initial "Net Missing" for default order quantities
            const initialOrderItems = stockStatus
                .map(item => {
                    const immediateMissing = Math.max(0, item.required - item.inStock)
                    const netMissing = Math.max(0, immediateMissing - (item.onOrder || 0))
                    return {
                        name: item.name,
                        quantity: netMissing
                    }
                })
                // Ensure we have entries for anything that is physically missing, so we can override quantity if needed
                .filter(i => {
                    const item = stockStatus.find(s => s.name === i.name)
                    if (!item) return false
                    const immediateMissing = Math.max(0, item.required - item.inStock)
                    return immediateMissing > 0
                })

            setOrderItems(initialOrderItems)

            // Only select items that actually need ordering (Net Missing > 0) by default
            const itemsToSelect = initialOrderItems.filter(i => i.quantity > 0).map(i => i.name)
            setSelectedItems(itemsToSelect)
        }
    }, [stockStatus, open])

    const handleQuantityChange = (name: string, quantity: number) => {
        setOrderItems(prev => prev.map(item =>
            item.name === name ? { ...item, quantity } : item
        ))
    }

    const toggleItemSelection = (name: string) => {
        setSelectedItems(prev =>
            prev.includes(name)
                ? prev.filter(i => i !== name)
                : [...prev, name]
        )
    }

    const handleCreateOrder = () => {
        if (!selectedSupplier) {
            toast.error('Please select a supplier')
            return
        }

        const itemsToOrder = orderItems.filter(item => selectedItems.includes(item.name))

        if (itemsToOrder.length === 0) {
            toast.error('No items selected for order')
            return
        }

        const orderPayload = {
            project: projectId,
            supplier: selectedSupplier,
            status: 'draft' as const,
            items: itemsToOrder.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: 0,
                description: `Restock for project items`
            }))
        }

        createOrderMutation.mutate(orderPayload)
    }

    const getStatusBadge = (status: 'ok' | 'low' | 'out') => {
        switch (status) {
            case 'ok': return <Badge className="bg-green-500 hover:bg-green-600">In Stock</Badge>
            case 'low': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Low Stock</Badge>
            case 'out': return <Badge variant="destructive">Out of Stock</Badge>
        }
    }

    const handleNext = () => {
        setStep(prev => (prev < 3 ? prev + 1 : prev) as 1 | 2 | 3)
    }

    const handleBack = () => {
        setStep(prev => (prev > 1 ? prev - 1 : prev) as 1 | 2 | 3)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) setStep(1) // Reset on close
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Check Stock
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 && "Step 1: Check Inventory"}
                        {step === 2 && "Step 2: Check Incoming Orders"}
                        {step === 3 && "Step 3: Create Purchase Order"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Review current stock levels against project requirements."}
                        {step === 2 && "Review items already on order from suppliers."}
                        {step === 3 && "Create a new purchase order for remaining missing items."}
                    </DialogDescription>
                </DialogHeader>

                {isLoadingStock ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* STEP 1: INVENTORY CHECK */}
                        {step === 1 && (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-right">Required</TableHead>
                                            <TableHead className="text-right">In Stock</TableHead>
                                            <TableHead className="text-right">Missing</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockStatus?.map((item) => (
                                            <TableRow key={item.name}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-right">{item.required}</TableCell>
                                                <TableCell className="text-right">{item.inStock}</TableCell>
                                                <TableCell className="text-right font-bold text-red-500">
                                                    {item.missing > 0 ? item.missing : '-'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {getStatusBadge(item.status)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* STEP 2: INCOMING CHECK */}
                        {step === 2 && (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-right">Missing (Immediate)</TableHead>
                                            <TableHead className="text-right">On Order</TableHead>
                                            <TableHead className="text-right">Net Missing</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stockStatus?.map((item) => {
                                            const immediateMissing = Math.max(0, item.required - item.inStock)
                                            const netMissing = Math.max(0, immediateMissing - (item.onOrder || 0))

                                            // Only show items that are missing immediately
                                            if (immediateMissing <= 0) return null

                                            return (
                                                <TableRow key={item.name}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-right text-red-500">{immediateMissing}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            {item.linkedOrders && item.linkedOrders.length > 0 ? (
                                                                <div className="grid grid-cols-[1fr,auto] gap-x-3 text-xs w-max min-w-[140px]">
                                                                    {item.linkedOrders.map((order: any) => (
                                                                        <div key={order.id} className="contents">
                                                                            <Link
                                                                                href={`/production/orders/${order.id}`}
                                                                                className="text-blue-500 hover:underline flex items-center gap-1 justify-end truncate"
                                                                                target="_blank"
                                                                            >
                                                                                #{order.id.substring(0, 8)}...
                                                                                <ExternalLink className="h-3 w-3" />
                                                                            </Link>
                                                                            <span className="font-mono">{order.quantity}</span>
                                                                        </div>
                                                                    ))}
                                                                    <div className="col-span-2 border-t my-1 border-muted-foreground/20"></div>
                                                                    <span className="text-right font-medium text-muted-foreground">Total:</span>
                                                                    <span className="text-right font-mono font-medium">{item.onOrder || 0}</span>
                                                                </div>
                                                            ) : (
                                                                <span>{item.onOrder || 0}</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        {netMissing > 0 ? (
                                                            <span className="text-red-600">{netMissing}</span>
                                                        ) : (
                                                            <span className="text-green-600">Covered</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* STEP 3: CREATE ORDER */}
                        {step === 3 && (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">Buy</TableHead>
                                                <TableHead>Item</TableHead>
                                                <TableHead className="text-right">Net Missing</TableHead>
                                                <TableHead className="text-right w-[150px]">Order Quantity</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stockStatus?.map((item) => {
                                                const immediateMissing = Math.max(0, item.required - item.inStock)
                                                // We show logic even if net missing is 0, user might want to buy extra
                                                if (immediateMissing <= 0) return null

                                                const netMissing = Math.max(0, immediateMissing - (item.onOrder || 0))
                                                const orderItem = orderItems.find(i => i.name === item.name)
                                                const isSelected = selectedItems.includes(item.name)

                                                return (
                                                    <TableRow key={item.name}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleItemSelection(item.name)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{item.name}</TableCell>
                                                        <TableCell className="text-right">
                                                            {netMissing > 0 ? (
                                                                <span className="text-red-500 font-bold">{netMissing}</span>
                                                            ) : (
                                                                <span className="text-muted-foreground">0</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {isSelected && (
                                                                <Input
                                                                    type="number"
                                                                    className="h-8 w-full text-right"
                                                                    value={orderItem?.quantity || 0}
                                                                    onChange={(e) => handleQuantityChange(item.name, parseInt(e.target.value) || 0)}
                                                                    min={1}
                                                                />
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="flex items-end gap-4 p-4 bg-muted/30 rounded-lg">
                                    <div className="grid gap-2 flex-1">
                                        <Label htmlFor="supplier">Select Supplier</Label>
                                        <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                            <SelectTrigger id="supplier">
                                                <SelectValue placeholder="Select a supplier..." />
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
                                </div>
                            </>
                        )}

                        <div className="flex justify-between pt-4 border-t">
                            {step > 1 ? (
                                <Button variant="outline" onClick={handleBack}>
                                    Back
                                </Button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <Button onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCreateOrder}
                                    disabled={createOrderMutation.isPending || !selectedSupplier || selectedItems.length === 0}
                                >
                                    {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Order
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
