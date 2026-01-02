import { publicProcedure, router } from '../init'
import { z } from 'zod'

export const projectsRouter = router({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const projects = await ctx.payload.find({
            collection: 'projects',
            depth: 1,
        })
        return projects.docs
    }),

    create: publicProcedure
        .input(
            z.object({
                title: z.string(),
                customer: z.string(),
                status: z.enum(['lead', 'discovery', 'proposal', 'production', 'delivery', 'completed']),
                deadline: z.string().optional(),
                value: z.number().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.payload.create({
                collection: 'projects',
                data: input,
            })
        }),

    updateStatus: publicProcedure
        .input(
            z.object({
                id: z.string(),
                status: z.enum(['lead', 'discovery', 'proposal', 'production', 'delivery', 'completed']),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return await ctx.payload.update({
                collection: 'projects',
                id: input.id,
                data: {
                    status: input.status,
                },
            })
        }),
})
