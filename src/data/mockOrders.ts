export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    date: string;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
    total: number;
}

export const mockOrders: Order[] = [
    {
        id: 'ORD-001',
        date: '2025-12-25',
        status: 'delivered',
        items: [
            { name: 'Skullpanda The Mare of Animals', quantity: 1, price: 550 },
            { name: 'Labubu The Monsters', quantity: 2, price: 890 },
        ],
        total: 2330
    },
    {
        id: 'ORD-002',
        date: '2025-12-28',
        status: 'shipped',
        items: [
            { name: 'Hirono Little Mischief', quantity: 1, price: 450 },
        ],
        total: 450
    },
    {
        id: 'ORD-003',
        date: '2025-12-30',
        status: 'pending',
        items: [
            { name: 'Crybaby Powerpuff Girls', quantity: 1, price: 1290 },
            { name: 'Molly Space 100%', quantity: 1, price: 690 },
        ],
        total: 1980
    }
];
