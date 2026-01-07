import type { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
    slug: 'projects',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'customer', 'status', 'deadline'],
    },
    fields: [
        {
            name: 'title',
            type: 'text',
            required: true,
        },
        {
            name: 'customer',
            type: 'relationship',
            relationTo: 'customers',
            required: true,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Lead', value: 'lead' },
                { label: 'Discovery', value: 'discovery' },
                { label: 'Proposal', value: 'proposal' },
                { label: 'In Production', value: 'production' },
                { label: 'Delivery', value: 'delivery' },
                { label: 'Completed', value: 'completed' },
            ],
            defaultValue: 'lead',
            required: true,
        },
        {
            name: 'deadline',
            type: 'date',
        },
        {
            name: 'description',
            type: 'richText',
        },
        {
            name: 'value',
            type: 'number',
            label: 'Project Value',
        },
        {
            name: 'items',
            type: 'array',
            label: 'Sold Items',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'description',
                    type: 'text',
                },
                {
                    name: 'quantity',
                    type: 'number',
                    required: true,
                    min: 1,
                },
                {
                    name: 'price',
                    type: 'number',
                    required: true,
                    min: 0,
                    label: 'Selling Price',
                },
            ],
        },
    ],
}
