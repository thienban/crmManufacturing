import { publicProcedure, router } from '../init'

export const dashboardRouter = router({
    getStats: publicProcedure.query(async ({ ctx }) => {
        const statuses = ['lead', 'discovery', 'proposal', 'production', 'delivery', 'completed'] as const

        const stats = await Promise.all(
            statuses.map(async (status) => {
                const result = await ctx.payload.count({
                    collection: 'projects',
                    where: {
                        status: {
                            equals: status,
                        },
                    },
                })
                return {
                    status,
                    count: result.totalDocs,
                }
            })
        )

        return stats
    }),

    getMissingStock: publicProcedure.query(async ({ ctx }) => {
        // 1. Fetch all projects in 'proposal' status
        const projects = await ctx.payload.find({
            collection: 'projects',
            where: {
                status: {
                    equals: 'proposal',
                },
            },
            depth: 0, // We only need the items array
            limit: 1000,
        })

        // 2. Aggregate required items
        const requiredItems = new Map<string, number>()
        projects.docs.forEach((project) => {
            if (project.items) {
                project.items.forEach((item) => {
                    const current = requiredItems.get(item.name) || 0
                    requiredItems.set(item.name, current + item.quantity)
                })
            }
        })

        if (requiredItems.size === 0) {
            return []
        }

        // 3. Fetch inventory for these items
        const itemNames = Array.from(requiredItems.keys())
        const inventory = await ctx.payload.find({
            collection: 'inventory',
            where: {
                name: {
                    in: itemNames,
                },
            },
            limit: 1000,
        })

        // 4. Calculate missing quantities
        const missingStock: {
            name: string
            required: number
            inStock: number
            missing: number
            unit: string
        }[] = []

        // Map inventory for quick lookup
        const inventoryMap = new Map(
            inventory.docs.map((item) => [item.name, { quantity: item.quantity, unit: item.unit }])
        )

        requiredItems.forEach((requiredQty, paramName) => {
            // Find matched inventory item (case-insensitive search might be better, but strict for now)
            // The 'in' query above should have found them if they exist
            const stockItem = inventoryMap.get(paramName)
            const inStock = stockItem?.quantity || 0
            const unit = stockItem?.unit || 'pcs'

            if (inStock < requiredQty) {
                missingStock.push({
                    name: paramName,
                    required: requiredQty,
                    inStock,
                    missing: requiredQty - inStock,
                    unit,
                })
            }
        })

        return missingStock
    }),
})
