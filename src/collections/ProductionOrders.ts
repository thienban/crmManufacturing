import type { CollectionConfig } from 'payload'

export const ProductionOrders: CollectionConfig = {
    slug: 'production-orders',
    admin: {
        useAsTitle: 'id',
    },
    fields: [
        {
            name: 'project',
            type: 'relationship',
            relationTo: 'projects',
            required: true,
        },
        {
            name: 'supplier',
            type: 'relationship',
            relationTo: 'suppliers',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Sent to Supplier', value: 'sent' },
                { label: 'In Production', value: 'in_production' },
                { label: 'Shipped', value: 'shipped' },
                { label: 'Received', value: 'received' },
            ],
            defaultValue: 'draft',
        },
        {
            name: 'items',
            type: 'array',
            fields: [
                {
                    name: 'description',
                    type: 'text',
                },
                {
                    name: 'quantity',
                    type: 'number',
                },
            ],
        },
        {
            name: 'expectedDelivery',
            type: 'date',
        },
    ],
}
