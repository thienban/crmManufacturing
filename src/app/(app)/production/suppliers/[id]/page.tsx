'use client'

import { trpc } from '@/trpc/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ArrowLeft, Mail, Phone, User, Package } from 'lucide-react'

export default function SupplierDetailPage() {
    const params = useParams()
    const supplierId = params.id as string
    const router = useRouter()

    const { data: supplier, isLoading } = trpc.suppliers.getById.useQuery({ id: supplierId })

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!supplier) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <h2 className="text-xl font-semibold">Supplier not found</h2>
                <Button variant="outline" onClick={() => router.push('/production')}>
                    Back to Production
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/production?tab=suppliers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{supplier.name}</h1>
                        <p className="text-muted-foreground">Supplier ID: {supplier.id}</p>
                    </div>
                </div>
                <Button variant="outline">
                    Edit Supplier
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                Contact Person
                            </div>
                            <span className="text-sm font-medium">{supplier.contactPerson || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="mr-2 h-4 w-4" />
                                Email
                            </div>
                            <span className="text-sm font-medium">{supplier.email || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-2 h-4 w-4" />
                                Phone
                            </div>
                            <span className="text-sm font-medium">{supplier.phone || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Products / Services</CardTitle>
                        <CardDescription>
                            What this supplier provides.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* If `products` was a field, we'd map it here. Assuming it might be added later or is free text. */}
                        <div className="text-center py-6 text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No specific products listed.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
