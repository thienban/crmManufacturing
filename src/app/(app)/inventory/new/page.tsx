'use client'

import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

export default function NewInventoryItemPage() {
    const router = useRouter()
    const { data: itemSuggestions } = trpc.inventory.getItemNames.useQuery()
    const [openCombobox, setOpenCombobox] = useState(false)

    const [formData, setFormData] = useState<{
        name: string
        description: string
        quantity: number | ''
        unit: string
        minQuantity: number | ''
        location: string
    }>({
        name: '',
        description: '',
        quantity: 0,
        unit: 'pcs',
        minQuantity: 0,
        location: '',
    })

    const createMutation = trpc.inventory.create.useMutation({
        onSuccess: () => {
            router.push('/inventory')
        },
        onError: (error) => {
            console.error('Failed to create inventory item:', error)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createMutation.mutate({
            ...formData,
            quantity: Number(formData.quantity) || 0,
            minQuantity: Number(formData.minQuantity) || 0,
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/inventory">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Add Inventory Item</h1>
                            <p className="text-muted-foreground">Create a new item in your inventory</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4">
                            <div className="grid gap-2 flex flex-col">
                                <Label htmlFor="name">Item Name *</Label>
                                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCombobox}
                                            className="justify-between"
                                        >
                                            {formData.name || "Select or type item name..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" align="start">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search item name..."
                                                value={formData.name}
                                                onValueChange={(value) => {
                                                    setFormData({ ...formData, name: value })
                                                }}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-2 text-sm text-muted-foreground">
                                                        No suggestions found. Type to create new.
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup heading="Suggestions">
                                                    {itemSuggestions?.map((suggestion) => (
                                                        <CommandItem
                                                            key={suggestion}
                                                            value={suggestion}
                                                            onSelect={(currentValue) => {
                                                                setFormData({ ...formData, name: currentValue })
                                                                setOpenCombobox(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    formData.name === suggestion ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {suggestion}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <p className="text-xs text-muted-foreground">
                                    Type to create a new item name or select from suggestions
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description of the item"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity">Initial Quantity *</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="0"
                                        value={formData.quantity}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            setFormData({
                                                ...formData,
                                                quantity: value === '' ? '' : parseInt(value)
                                            })
                                        }}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Unit of Measurement</Label>
                                    <Input
                                        id="unit"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        placeholder="e.g., pcs, kg, m"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="minQuantity">Minimum Quantity (Alert Threshold)</Label>
                                    <Input
                                        id="minQuantity"
                                        type="number"
                                        min="0"
                                        value={formData.minQuantity}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            setFormData({
                                                ...formData,
                                                minQuantity: value === '' ? '' : parseInt(value)
                                            })
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        You'll be alerted when stock falls below this level
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="location">Storage Location</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., Warehouse A, Shelf 3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => router.push('/inventory')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Package className="mr-2 h-4 w-4" />
                                        Create Item
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}
