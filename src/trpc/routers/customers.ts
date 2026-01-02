import { publicProcedure, router } from '../init'
import { z } from 'zod'

export const customersRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const customers = await ctx.payload.find({
            collection: 'customers',
        })
        return customers.docs
    }),

    create: publicProcedure
        .input(
            z.object({
                name: z.string(),
                email: z.string().email(),
                status: z.enum(['active', 'inactive', 'pending']),
                type: z.enum(['customer', 'prospect']),
                contactPerson: z.string().optional(),
                phone: z.string().optional(),
                address: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.payload.create({
                collection: 'customers',
                data: input,
            })
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const customer = await ctx.payload.findByID({
                collection: 'customers',
                id: input.id,
            })
            return customer
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    name: z.string().optional(),
                    email: z.string().email().optional(),
                    status: z.enum(['active', 'inactive', 'pending']).optional(),
                    type: z.enum(['customer', 'prospect']).optional(),
                    contactPerson: z.string().optional(),
                    phone: z.string().optional(),
                    address: z.string().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.payload.update({
                collection: 'customers',
                id: input.id,
                data: input.data,
            })
        }),
})
