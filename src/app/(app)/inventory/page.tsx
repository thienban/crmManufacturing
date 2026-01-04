'use client'

import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Package, AlertTriangle, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function InventoryPage() {
    const { data: inventory, isLoading } = trpc.inventory.getAll.useQuery()
    const { data: incomingStock } = trpc.inventory.getIncomingStock.useQuery()

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const lowStockItems = inventory?.filter(
        (item: any) => item.quantity <= (item.minQuantity || 0)
    ) || []

    const totalItems = inventory?.length || 0
    const totalQuantity = inventory?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0
    const lowStockCount = lowStockItems.length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground">Manage your stock and track incoming items</p>
                </div>
                <Button asChild>
                    <Link href="/inventory/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalQuantity}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{lowStockCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Incoming Items</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{incomingStock?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="current" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="current">Current Stock</TabsTrigger>
                    <TabsTrigger value="incoming">Incoming Stock</TabsTrigger>
                    <TabsTrigger value="low">Low Stock</TabsTrigger>
                </TabsList>

                {/* Current Stock Tab */}
                <TabsContent value="current">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {inventory && inventory.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventory.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.description || '-'}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell>{item.unit || 'pcs'}</TableCell>
                                                <TableCell>{item.location || '-'}</TableCell>
                                                <TableCell>
                                                    {item.quantity <= (item.minQuantity || 0) ? (
                                                        <Badge variant="destructive">Low Stock</Badge>
                                                    ) : (
                                                        <Badge variant="default">In Stock</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/inventory/${item.id}`}>View</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No inventory items yet</p>
                                    <Button className="mt-4" asChild>
                                        <Link href="/inventory/new">Add Your First Item</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Incoming Stock Tab */}
                <TabsContent value="incoming">
                    <Card>
                        <CardHeader>
                            <CardTitle>Incoming Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {incomingStock && incomingStock.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item Name</TableHead>
                                            <TableHead className="text-right">Incoming Quantity</TableHead>
                                            <TableHead className="text-right">From Orders</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {incomingStock.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell className="text-right">{item.orders}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No incoming stock from pending orders</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Low Stock Tab */}
                <TabsContent value="low">
                    <Card>
                        <CardHeader>
                            <CardTitle>Low Stock Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowStockItems.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item Name</TableHead>
                                            <TableHead className="text-right">Current Quantity</TableHead>
                                            <TableHead className="text-right">Minimum Quantity</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lowStockItems.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-right text-orange-500 font-bold">
                                                    {item.quantity}
                                                </TableCell>
                                                <TableCell className="text-right">{item.minQuantity || 0}</TableCell>
                                                <TableCell>{item.location || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/inventory/${item.id}`}>Restock</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>All items are adequately stocked</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
