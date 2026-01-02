'use client'

import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { CreateCustomerSheet } from '@/components/customers/CreateCustomerSheet'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus } from 'lucide-react'

export default function CustomersPage() {
    const { data: customers, isLoading } = trpc.customers.getAll.useQuery()

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage your customers and prospects.
                    </p>
                </div>
                <CreateCustomerSheet />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Contact Person</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers?.map((customer) => (
                                <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <Link href={`/customers/${customer.id}`} className="hover:underline">
                                            {customer.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                                            {customer.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{customer.type}</Badge>
                                    </TableCell>
                                    <TableCell>{customer.contactPerson || '-'}</TableCell>
                                </TableRow>
                            ))}
                            {customers?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
