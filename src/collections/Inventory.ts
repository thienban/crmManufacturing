import type { CollectionConfig } from 'payload'

export const Inventory: CollectionConfig = {
    slug: 'inventory',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'quantity', 'unit', 'location', 'lastRestocked'],
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Item Name',
        },
        {
            name: 'description',
            type: 'text',
            label: 'Description',
        },
        {
            name: 'quantity',
            type: 'number',
            required: true,
            defaultValue: 0,
            min: 0,
            label: 'Current Quantity',
        },
        {
            name: 'unit',
            type: 'text',
            label: 'Unit of Measurement',
            defaultValue: 'pcs',
        },
        {
            name: 'minQuantity',
            type: 'number',
            label: 'Minimum Quantity (Alert Threshold)',
            defaultValue: 0,
            min: 0,
        },
        {
            name: 'location',
            type: 'text',
            label: 'Storage Location',
        },
        {
            name: 'lastRestocked',
            type: 'date',
            label: 'Last Restocked Date',
        },
        {
            name: 'notes',
            type: 'richText',
            label: 'Notes',
        },
    ],
}
