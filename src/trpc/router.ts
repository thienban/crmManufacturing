import { router } from './init'
import { customersRouter } from './routers/customers'
import { projectsRouter } from './routers/projects'
import { suppliersRouter } from './routers/suppliers'
import { productionRouter } from './routers/production'
import { authRouter } from './routers/auth'
import { inventoryRouter } from './routers/inventory'
import { dashboardRouter } from './routers/dashboard'

export const appRouter = router({
    customers: customersRouter,
    projects: projectsRouter,
    suppliers: suppliersRouter,
    production: productionRouter,
    auth: authRouter,
    inventory: inventoryRouter,
    dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter
