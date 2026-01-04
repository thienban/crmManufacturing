import { publicProcedure, router } from '../init'
import { z } from 'zod'

export const productionRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const orders = await ctx.payload.find({
            collection: 'production-orders',
            depth: 2, // Fetch related project and supplier
        })
        return orders.docs
    }),

    getOrderById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.payload.findByID({
                collection: 'production-orders',
                id: input.id,
                depth: 2,
            })
        }),

    create: publicProcedure
        .input(
            z.object({
                project: z.string(),
                supplier: z.string(),
                status: z.enum(['draft', 'sent', 'in_production', 'shipped', 'received']),
                expectedDelivery: z.string().optional(),
                items: z.array(z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    quantity: z.number().min(1),
                    price: z.number().min(0),
                })).optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.payload.create({
                collection: 'production-orders',
                data: input,
            })
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                project: z.string().optional(),
                supplier: z.string().optional(),
                status: z.enum(['draft', 'sent', 'in_production', 'shipped', 'received']).optional(),
                expectedDelivery: z.string().optional(),
                items: z.array(z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    quantity: z.number().min(1),
                    price: z.number().min(0),
                })).optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input

            // Get the previous order state to check if status changed to 'received'
            const previousOrder = await ctx.payload.findByID({
                collection: 'production-orders',
                id,
                depth: 0,
            })

            // Update the order
            const updatedOrder = await ctx.payload.update({
                collection: 'production-orders',
                id,
                data,
            })

            // If status changed to 'received', update inventory
            if (data.status === 'received' && previousOrder.status !== 'received' && updatedOrder.items) {
                for (const item of updatedOrder.items) {
                    try {
                        // Try to find existing inventory item by name
                        const existingInventory = await ctx.payload.find({
                            collection: 'inventory',
                            where: {
                                name: {
                                    equals: item.name,
                                },
                            },
                            limit: 1,
                        })

                        if (existingInventory.docs.length > 0) {
                            // Update existing inventory
                            const inventoryItem = existingInventory.docs[0]
                            await ctx.payload.update({
                                collection: 'inventory',
                                id: inventoryItem.id,
                                data: {
                                    quantity: (inventoryItem.quantity || 0) + (item.quantity || 0),
                                    lastRestocked: new Date().toISOString(),
                                },
                            })
                        } else {
                            // Create new inventory item
                            await ctx.payload.create({
                                collection: 'inventory',
                                data: {
                                    name: item.name,
                                    description: item.description || '',
                                    quantity: item.quantity || 0,
                                    unit: 'pcs',
                                    minQuantity: 0,
                                    lastRestocked: new Date().toISOString(),
                                },
                            })
                        }
                    } catch (error) {
                        console.error(`Failed to update inventory for item ${item.name}:`, error)
                    }
                }
            }

            return updatedOrder
        }),
})
