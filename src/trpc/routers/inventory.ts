import { publicProcedure, router } from '../init'
import { z } from 'zod'

export const inventoryRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const inventory = await ctx.payload.find({
            collection: 'inventory',
            sort: 'name',
        })
        return inventory.docs
    }),

    getItemByName: publicProcedure
        .input(z.object({ name: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.payload.find({
                collection: 'inventory',
                where: {
                    name: {
                        equals: input.name,
                    },
                },
                limit: 1,
            })
            return result.docs[0] || null
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.payload.findByID({
                collection: 'inventory',
                id: input.id,
            })
        }),

    getLowStock: publicProcedure.query(async ({ ctx }) => {
        const inventory = await ctx.payload.find({
            collection: 'inventory',
            where: {
                quantity: {
                    less_than_equal: {
                        minQuantity: true,
                    },
                },
            },
        })
        return inventory.docs
    }),

    getIncomingStock: publicProcedure.query(async ({ ctx }) => {
        // Get all orders that are not yet received (sent, in_production, shipped)
        const orders = await ctx.payload.find({
            collection: 'production-orders',
            where: {
                status: {
                    in: ['sent', 'in_production', 'shipped'],
                },
            },
            depth: 0,
        })

        // Aggregate items by name
        const incomingStock: { [key: string]: { name: string; quantity: number; orders: number } } = {}

        orders.docs.forEach((order: any) => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const key = item.name
                    if (!incomingStock[key]) {
                        incomingStock[key] = {
                            name: item.name,
                            quantity: 0,
                            orders: 0,
                        }
                    }
                    incomingStock[key].quantity += item.quantity || 0
                    incomingStock[key].orders += 1
                })
            }
        })

        return Object.values(incomingStock)
    }),

    getItemNames: publicProcedure.query(async ({ ctx }) => {
        // Fetch inventory names
        const inventory = await ctx.payload.find({
            collection: 'inventory',
            limit: 1000,
            pagination: false,
        })
        const inventoryNames = inventory.docs.map((item: any) => item.name)

        // Fetch production order item names
        const orders = await ctx.payload.find({
            collection: 'production-orders',
            limit: 1000,
            pagination: false,
        })
        const orderItemNames = orders.docs.flatMap((order: any) =>
            (order.items || []).map((item: any) => item.name)
        )

        // Combine and deduplicate
        const allNames = [...new Set([...inventoryNames, ...orderItemNames])]
            .filter((name): name is string => typeof name === 'string' && name.length > 0)
            .sort()

        return allNames
    }),

    create: publicProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string().optional(),
                quantity: z.number().min(0),
                unit: z.string().optional(),
                minQuantity: z.number().min(0).optional(),
                location: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.payload.create({
                collection: 'inventory',
                data: {
                    ...input,
                    lastRestocked: new Date().toISOString(),
                },
            })
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().optional(),
                description: z.string().optional(),
                quantity: z.number().min(0).optional(),
                unit: z.string().optional(),
                minQuantity: z.number().min(0).optional(),
                location: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input
            return await ctx.payload.update({
                collection: 'inventory',
                id,
                data,
            })
        }),

    adjustStock: publicProcedure
        .input(
            z.object({
                id: z.string(),
                adjustment: z.number(),
                reason: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Get current inventory item
            const item = await ctx.payload.findByID({
                collection: 'inventory',
                id: input.id,
            })

            const newQuantity = (item.quantity || 0) + input.adjustment

            if (newQuantity < 0) {
                throw new Error('Insufficient stock for this adjustment')
            }

            return await ctx.payload.update({
                collection: 'inventory',
                id: input.id,
                data: {
                    quantity: newQuantity,
                    lastRestocked: input.adjustment > 0 ? new Date().toISOString() : item.lastRestocked,
                },
            })
        }),
    removeStock: publicProcedure
        .input(
            z.object({
                id: z.string(),
                quantity: z.number().min(1),
                type: z.enum(['resell', 'manufactured', 'adjustment']),
                date: z.string(),
                notes: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const item = await ctx.payload.findByID({
                collection: 'inventory',
                id: input.id,
            })

            const newQuantity = (item.quantity || 0) - input.quantity

            if (newQuantity < 0) {
                throw new Error('Insufficient stock')
            }

            const movement = {
                type: input.type,
                quantity: input.quantity,
                date: input.date,
                notes: input.notes,
            }

            const currentMovements = (item.stockMovements as any[]) || []

            return await ctx.payload.update({
                collection: 'inventory',
                id: input.id,
                data: {
                    quantity: newQuantity,
                    stockMovements: [...currentMovements, movement],
                },
            })
        }),
})
