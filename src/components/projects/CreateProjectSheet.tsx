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
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const projectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    customer: z.string().min(1, 'Customer is required'),
    status: z.enum(['lead', 'discovery', 'proposal', 'production', 'delivery', 'completed']),
    deadline: z.string().optional(),
    value: z.coerce.number().optional(),
    items: z.array(z.object({
        name: z.string().min(1, 'Item name is required'),
        description: z.string().optional(),
        quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
        price: z.coerce.number().min(0, 'Price must be non-negative'),
    })),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export function CreateProjectSheet() {
    const [open, setOpen] = useState(false)
    const utils = trpc.useUtils()
    // Fetch customers for select
    const { data: customers } = trpc.customers.getAll.useQuery()

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema) as any,
        defaultValues: {
            status: 'lead',
            value: undefined,
            items: [],
        },
    })

    // Add useFieldArray specifically for items
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const createProject = trpc.projects.create.useMutation({
        onSuccess: () => {
            toast.success('Project created successfully')
            utils.projects.getAll.invalidate()
            setOpen(false)
            form.reset()
        },
        onError: (error) => {
            toast.error('Failed to create project', {
                description: error.message
            })
        },
    })

    function onSubmit(data: ProjectFormValues) {
        createProject.mutate({
            ...data,
            items: data.items || []
        })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto min-w-[400px] sm:min-w-[600px] sm:max-w-[800px] sm:w-full">
                <SheetHeader>
                    <SheetTitle>New Project</SheetTitle>
                    <SheetDescription>
                        Create a new project linked to a customer.
                    </SheetDescription>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Website Redesign" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="customer"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {customers?.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="lead">Lead</SelectItem>
                                            <SelectItem value="discovery">Discovery</SelectItem>
                                            <SelectItem value="proposal">Proposal</SelectItem>
                                            <SelectItem value="production">In Production</SelectItem>
                                            <SelectItem value="delivery">Delivery</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="deadline"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Deadline</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Value ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="5000" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Sold Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ name: '', quantity: 1, price: 0 })}
                                >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Add Item
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md">
                                    <div className="col-span-12 sm:col-span-5">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Item Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Service" {...field} />
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
                                                        <Input type="number" min="1" {...field} />
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
                                                        <Input type="number" min="0" {...field} />
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
                                            className="h-8 w-8 text-destructive"
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
                                <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-md">
                                    No items added yet.
                                </div>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={createProject.isPending}>
                            {createProject.isPending ? 'Creating...' : 'Create Project'}
                        </Button>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
