import { TRPCProvider } from '@/trpc/Provider'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <TRPCProvider>
            <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
                {children}
            </div>
        </TRPCProvider>
    )
}
