'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/trpc/client'
import { AlertTriangle } from 'lucide-react'

export function MissingStockList() {
    const { data: missingItems, isLoading } = trpc.dashboard.getMissingStock.useQuery()

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Checking stock levels...</div>
    }

    if (!missingItems || missingItems.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-green-600">
                        <span className="text-sm">All quoted items are in stock.</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-red-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Stock Alerts
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Required</TableHead>
                            <TableHead className="text-right">In Stock</TableHead>
                            <TableHead className="text-right">Missing</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {missingItems.map((item) => (
                            <TableRow key={item.name}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{item.required} {item.unit}</TableCell>
                                <TableCell className="text-right">{item.inStock} {item.unit}</TableCell>
                                <TableCell className="text-right font-bold text-red-600">
                                    {item.missing} {item.unit}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
