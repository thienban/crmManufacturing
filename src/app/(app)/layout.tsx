import { TRPCProvider } from '@/trpc/Provider'
import { Sidebar } from '@/components/Sidebar'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <TRPCProvider>
            <div className="flex h-screen bg-background">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </TRPCProvider>
    )
}
