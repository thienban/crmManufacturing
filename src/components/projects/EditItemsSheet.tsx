'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'

// Schema for items only, but we need to match the update schema structure if nested
// The update router usually expects { id, items: [...] }
const itemsSchema = z.object({
    items: z.array(z.object({
        name: z.string().min(1, 'Item name is required'),
        description: z.string().optional(),
        quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
        price: z.coerce.number().min(0, 'Price must be non-negative'),
        // id field might be needed if updating existing sub-items in some DBs, 
        // but Payload usually replaces the array if it's a JSON/Array field, 
        // or uses IDs if it's a relationship. Here it's an array schema in the doc.
        id: z.string().optional(),
    })),
})

type ItemsFormValues = z.infer<typeof itemsSchema>

interface EditItemsSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectId: string
    initialItems: any[]
}

export function EditItemsSheet({ open, onOpenChange, projectId, initialItems }: EditItemsSheetProps) {
    const utils = trpc.useUtils()

    const form = useForm<ItemsFormValues>({
        resolver: zodResolver(itemsSchema) as any,
        defaultValues: {
            items: initialItems || [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    // Reset form when opening with new items
    useEffect(() => {
        if (open) {
            form.reset({
                items: initialItems || [],
            })
        }
    }, [open, initialItems, form])

    const updateProject = trpc.projects.update.useMutation({
        onSuccess: () => {
            toast.success('Items updated successfully')
            utils.projects.getById.invalidate({ id: projectId })
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error('Failed to update items', {
                description: error.message
            })
        },
    })

    function onSubmit(data: ItemsFormValues) {
        // We only send items to update
        updateProject.mutate({
            id: projectId,
            items: data.items.map(item => ({
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                // We typically don't send back the auto-generated sub-ID unless specifically needed for diffing,
                // but Payload often regenerating IDs for array items is common. 
                // Let's strip ID to be safe and let Payload handle it, or keep it if Payload supports update-by-id in array.
                // Usually for simple array fields, it replaces the whole array.
            })),
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto min-w-[400px] sm:min-w-[600px] sm:max-w-[800px] sm:w-full">
                <SheetHeader>
                    <SheetTitle>Manage Sold Items</SheetTitle>
                    <SheetDescription>
                        Add, edit, or remove items for this project.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Items List</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ name: '', quantity: 1, price: 0, description: '' })}
                                >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Add Item
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md bg-muted/10">
                                    <div className="col-span-12 sm:col-span-5">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Item Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Service or Product" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Qty</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Price ($)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="col-span-4 sm:col-span-2 flex justify-end pb-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="col-span-12">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Description (optional)" className="h-8 text-xs" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-md">
                                    No items added yet. Click "Add Item" to start.
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateProject.isPending}>
                                {updateProject.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Items
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
