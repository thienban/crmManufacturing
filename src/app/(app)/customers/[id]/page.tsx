'use client'

import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Separator } from '@/components/ui/separator'

export default function CustomerDetailPage() {
    const params = useParams()
    const customerId = params.id as string

    const { data: customer, isLoading } = trpc.customers.getById.useQuery({ id: customerId })

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <h2 className="text-xl font-semibold">Customer not found</h2>
                <Button asChild>
                    <Link href="/customers">Back to Customers</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/customers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                        <p className="text-muted-foreground">{customer.type === 'customer' ? 'Customer' : 'Prospect'}</p>
                    </div>
                </div>
                <Button>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Customer
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Email</span>
                            <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Phone</span>
                            <span className="text-sm">{customer.phone || '-'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Contact Person</span>
                            <span className="text-sm">{customer.contactPerson || '-'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Address</span>
                            <span className="text-sm">{customer.address || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                                {customer.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
