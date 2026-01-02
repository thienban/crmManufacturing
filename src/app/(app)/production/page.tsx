'use client'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateOrderSheet } from '@/components/production/CreateOrderSheet'
import { CreateSupplierSheet } from '@/components/production/CreateSupplierSheet'
import { trpc } from '@/trpc/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ProductionPage() {
    const { data: orders } = trpc.production.getAll.useQuery()
    const { data: suppliers } = trpc.suppliers.getAll.useQuery()

    return (
        <div className="flex flex-col h-full space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Production</h1>
                <p className="text-muted-foreground">Manage production orders and suppliers.</p>
            </div>

            <Tabs defaultValue="orders" className="flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="orders" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <CreateOrderSheet />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Production Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Supplier</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Expected Delivery</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders?.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/projects/${typeof order.project === 'object' ? order.project.id : order.project}`} className="hover:underline">
                                                    {order.project?.title || 'Unknown Project'}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/production/suppliers/${typeof order.supplier === 'object' ? order.supplier.id : order.supplier}`} className="hover:underline">
                                                    {order.supplier?.name || 'Unknown Supplier'}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/production/orders/${order.id}`} className="hover:underline inline-flex items-center">
                                                    <Badge variant="outline" className="mr-2">{order.status}</Badge>
                                                    <span className="text-muted-foreground text-xs">View Order</span>
                                                </Link>
                                            </TableCell>
                                            <TableCell>{order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {orders?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No orders found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4 mt-4">
                    <div className="flex justify-end">
                        <CreateSupplierSheet />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Suppliers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suppliers?.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell className="font-medium">
                                                <Link href={`/production/suppliers/${supplier.id}`} className="hover:underline">
                                                    {supplier.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{supplier.contactPerson || '-'}</TableCell>
                                            <TableCell>{supplier.email || '-'}</TableCell>
                                            <TableCell>{supplier.phone || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {suppliers?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No suppliers found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
