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

    create: publicProcedure
        .input(
            z.object({
                project: z.string(),
                supplier: z.string(),
                status: z.enum(['draft', 'sent', 'in_production', 'shipped', 'received']),
                expectedDelivery: z.string().optional(),
                items: z.array(z.object({
                    description: z.string().optional(),
                    quantity: z.number().optional(),
                })).optional()
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.payload.create({
                collection: 'production-orders',
                data: input,
            })
        }),
})
