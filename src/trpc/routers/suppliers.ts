import { publicProcedure, router } from '../init'
import { z } from 'zod'

export const suppliersRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const suppliers = await ctx.payload.find({
            collection: 'suppliers',
        })
        return suppliers.docs
    }),

    create: publicProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email().optional().or(z.literal('')),
                contactPerson: z.string().optional(),
                phone: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.payload.create({
                collection: 'suppliers',
                data: input,
            })
        }),
})
