import { QueryClient } from '@tanstack/react-query'
import SuperJSON from 'superjson'

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
            dehydrate: {
                serializeData: SuperJSON.serialize,
                shouldDehydrateQuery: (query) =>
                    query.state.status === 'pending' || query.state.status === 'error',
            },
            hydrate: {
                deserializeData: SuperJSON.deserialize,
            },
        },
    })
}
