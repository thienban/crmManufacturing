import { priceScope } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { ChevronsUpDown, Check, Trash2, Info } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { trpc } from "@/trpc/client"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

interface OrderItemRowProps {
    index: number
    form: any
    remove: (index: number) => void
    itemSuggestions: string[] | undefined
}

// Sub-component for individual item row to manage Popover state
export const OrderItemRow = ({
    index,
    form,
    remove,
    itemSuggestions
}: OrderItemRowProps) => {
    const [open, setOpen] = useState(false)
    const nameValue = form.watch(`items.${index}.name`)

    const { data: itemDetails } = trpc.inventory.getItemByName.useQuery(
        { name: nameValue },
        { enabled: !!nameValue }
    )

    return (
        <div className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md">
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name={`items.${index}.name`}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <FormLabel className="text-xs">Name</FormLabel>
                                {itemDetails && (
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <Info className="h-3 w-3 text-muted-foreground cursor-pointer" />
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-80">
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold">{itemDetails.name}</h4>
                                                <div className="text-sm">
                                                    Current Stock: <span className="font-bold">{itemDetails.quantity}</span>
                                                    {itemDetails.unit && <span className="text-muted-foreground ml-1">{itemDetails.unit}</span>}
                                                </div>
                                                {itemDetails.description && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {itemDetails.description}
                                                    </p>
                                                )}
                                                {itemDetails.location && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Location: {itemDetails.location}
                                                    </p>
                                                )}
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                )}
                            </div>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value || "Select..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search item..."
                                            value={field.value}
                                            onValueChange={(value) => {
                                                form.setValue(`items.${index}.name`, value)
                                            }}
                                        />
                                        <CommandList>
                                            <CommandEmpty>No item found. Type to create new.</CommandEmpty>
                                            <CommandGroup heading="Suggestions">
                                                {itemSuggestions?.map((suggestion) => (
                                                    <CommandItem
                                                        value={suggestion}
                                                        key={suggestion}
                                                        onSelect={(currentValue) => {
                                                            form.setValue(`items.${index}.name`, currentValue)
                                                            setOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                suggestion === field.value
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
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
                            {itemDetails && (
                                <div className="text-[10px] text-muted-foreground mt-1">
                                    Stock: {itemDetails.quantity} {itemDetails.unit}
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="col-span-3">
                <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Desc</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Description" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="col-span-2">
                <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Qty</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" min="1" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="col-span-2">
                <FormField
                    control={form.control}
                    name={`items.${index}.price`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs">Price</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" min="0" step={priceScope} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="col-span-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                >
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    )
}
