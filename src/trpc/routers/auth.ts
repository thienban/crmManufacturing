import { publicProcedure, router } from '../init'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const authRouter = router({
    signup: publicProcedure
        .input(
            z.object({
                email: z.string().email('Invalid email address'),
                password: z.string().min(8, 'Password must be at least 8 characters'),
                confirmPassword: z.string(),
            })
                .refine((data) => data.password === data.confirmPassword, {
                    message: "Passwords don't match",
                    path: ["confirmPassword"],
                })
        )
        .mutation(async ({ ctx, input }) => {
            const { email, password } = input
            console.log('Server received signup input:', { email, passwordLength: password.length })

            try {
                // Check if user exists
                const existingUser = await ctx.payload.find({
                    collection: 'users',
                    where: {
                        email: {
                            equals: email,
                        },
                    },
                    overrideAccess: true,
                })

                console.log('Existing users found:', existingUser.totalDocs)

                if (existingUser.totalDocs > 0) {
                    console.warn('User already exists:', email)
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'User with this email already exists',
                    })
                }

                console.log('Creating user in Payload...')
                await ctx.payload.create({
                    collection: 'users',
                    data: {
                        email,
                        password,
                    },
                    overrideAccess: true,
                })
                console.log('User created successfully')

                return { success: true }
            } catch (error) {
                console.error('Signup processing error:', error)
                if (error instanceof TRPCError) throw error

                // If it's a Payload validation error (e.g. password requirements?), it usually comes as an Error
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to create user',
                })
            }
        }),
})
