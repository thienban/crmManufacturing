import { router } from './init'
import { customersRouter } from './routers/customers'
import { projectsRouter } from './routers/projects'
import { suppliersRouter } from './routers/suppliers'
import { productionRouter } from './routers/production'
import { authRouter } from './routers/auth'
import SuperJSON from 'superjson'

export const appRouter = router({
    customers: customersRouter,
    projects: projectsRouter,
    suppliers: suppliersRouter,
    production: productionRouter,
    auth: authRouter,
})

export type AppRouter = typeof appRouter
