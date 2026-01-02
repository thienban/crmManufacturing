import { initTRPC } from '@trpc/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Payload } from 'payload'

export const createContext = async () => {
    const payload = await getPayload({ config: configPromise })
    return {
        payload,
    }
}

type Context = Awaited<ReturnType<typeof createContext>>

import SuperJSON from 'superjson'

const t = initTRPC.context<Context>().create({
    transformer: SuperJSON,
})

export const router = t.router
export const publicProcedure = t.procedure
