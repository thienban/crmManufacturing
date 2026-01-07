'use client'

import { trpc } from '@/trpc/client'
import { Badge } from '@/components/ui/badge'
import { Loader2, Factory, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ProjectOrdersList({ projectId }: { projectId: string }) {
    const { data: orders, isLoading } = trpc.production.getOrdersByProject.useQuery({ projectId })

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <Factory className="h-10 w-10 mb-4 opacity-50" />
                <p>No orders linked to this project yet.</p>
                <p className="text-sm mt-1">Use "Check Stock" in Quotation tab to create orders.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-medium">Order ID</th>
                        <th className="p-3 text-left font-medium">Supplier</th>
                        <th className="p-3 text-center font-medium">Status</th>
                        <th className="p-3 text-center font-medium">Items</th>
                        <th className="p-3 text-right font-medium">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order: any) => {
                        const supplierName = typeof order.supplier === 'object' ? order.supplier.name : 'Unknown Supplier'
                        const itemCount = order.items?.length || 0
                        const totalAmount = order.items?.reduce((acc: number, item: any) => acc + ((item.price || 0) * (item.quantity || 0)), 0) || 0

                        return (
                            <tr key={order.id} className="border-b last:border-0 hover:bg-muted/5">
                                <td className="p-3 font-mono text-xs">
                                    <Link href={`/production/orders/${order.id}`} className="hover:underline">
                                        {order.id}
                                    </Link>
                                </td>
                                <td className="p-3">{supplierName}</td>
                                <td className="p-3 text-center">
                                    <Badge variant="outline" className="capitalize">
                                        {order.status.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td className="p-3 text-center">{itemCount}</td>
                                <td className="p-3 text-right">${totalAmount.toLocaleString()}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
