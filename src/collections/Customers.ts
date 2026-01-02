import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
    slug: 'customers',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'email', 'status', 'type'],
    },
    access: {
        read: () => true,
        create: () => true, // TODO: Restrict to authenticated users later
        update: () => true,
        delete: () => true,
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
            label: 'Company / Name',
        },
        {
            name: 'contactPerson',
            type: 'text',
            label: 'Contact Person',
        },
        {
            name: 'email',
            type: 'email',
            required: true,
            unique: true,
        },
        {
            name: 'phone',
            type: 'text',
        },
        {
            name: 'status',
            type: 'select',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending', value: 'pending' },
            ],
            defaultValue: 'active',
            required: true,
        },
        {
            name: 'type',
            type: 'select',
            options: [
                { label: 'Customer', value: 'customer' },
                { label: 'Prospect', value: 'prospect' },
            ],
            defaultValue: 'prospect',
            required: true,
        },
        {
            name: 'address',
            type: 'textarea',
        },
        {
            name: 'notes',
            type: 'richText',
        },
    ],
}
