import type { CollectionConfig } from 'payload'

export const Suppliers: CollectionConfig = {
    slug: 'suppliers',
    admin: {
        useAsTitle: 'name',
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'contactPerson',
            type: 'text',
        },
        {
            name: 'email',
            type: 'email',
        },
        {
            name: 'phone',
            type: 'text',
        },
        {
            name: 'products',
            type: 'array',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                },
            ],
        },
    ],
}
