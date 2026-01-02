'use client'

import { trpc } from '@/trpc/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowLeft, Truck, Calendar, Box, Package } from 'lucide-react'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function ProductionOrderDetailPage() {
    const params = useParams()
    const orderId = params.id as string
    const router = useRouter()

    const { data: order, isLoading } = trpc.production.getOrderById.useQuery({ id: orderId })

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
                <h2 className="text-xl font-semibold">Order not found</h2>
                <Button variant="outline" onClick={() => router.push('/production')}>
                    Back to Production
                </Button>
            </div>
        )
    }

    // Safely handle relations
    const supplierName = typeof order.supplier === 'object' && order.supplier !== null
        ? (order.supplier as any).name
        : 'Unknown Supplier'

    const projectName = typeof order.project === 'object' && order.project !== null
        ? (order.project as any).title
        : 'Unknown Project'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/production">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id.slice(-6)}</h1>
                            <Badge variant={order.status === 'received' ? 'default' : 'secondary'}>
                                {order.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            For Project: <span className="font-medium text-foreground">{projectName}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.items && order.items.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.name || 'Item'}</TableCell>
                                                <TableCell>{item.description || '-'}</TableCell>
                                                <TableCell className="text-right">{item.quantity || 1}</TableCell>
                                                <TableCell className="text-right">${item.price || 0}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${((item.quantity || 1) * (item.price || 0)).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No items listed.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Supplier Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Truck className="mr-2 h-4 w-4" />
                                    Supplier
                                </div>
                                <span className="text-sm font-medium">{supplierName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Expected Delivery
                                </div>
                                <span className="text-sm font-medium">
                                    {order.expectedDelivery ? format(new Date(order.expectedDelivery), 'PPP') : '-'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
