export interface OrderItem {
    id?: number | string;
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
    carrier?: 'Thailand Post' | 'Kerry Express' | 'Flash Express' | 'J&T Express';
    trackingNumber?: string;
    payment?: {
        method: string;
        transferDate?: string;
        transferTime?: string;
        slipImage?: string;
    };
}

export const mockOrders: Order[] = [
    {
        id: 'ORD-001',
        date: '2025-12-25',
        status: 'delivered',
        items: [
            { id: 1, name: 'Skullpanda The Mare of Animals', quantity: 1, price: 550 },
            { id: 3, name: 'Labubu The Monsters', quantity: 2, price: 890 },
        ],
        total: 2330,
        carrier: 'Thailand Post',
        trackingNumber: 'TH123456789TH'
    },
    {
        id: 'ORD-002',
        date: '2025-12-28',
        status: 'shipped',
        items: [
            { id: 5, name: 'Hirono Little Mischief', quantity: 1, price: 450 },
        ],
        total: 450,
        carrier: 'Kerry Express',
        trackingNumber: 'KERDO12345678'
    },
    {
        id: 'ORD-003',
        date: '2025-12-30',
        status: 'pending',
        items: [
            { id: 13, name: 'Crybaby Powerpuff Girls', quantity: 1, price: 1290 },
            { id: 14, name: 'Molly Space 100%', quantity: 1, price: 690 },
        ],
        total: 1980
    },
    {
        id: 'ORD-841775',
        date: '2026-01-01',
        status: 'pending',
        items: [
            { id: 2, name: 'Genshin Impact: Raiden Shogun Statue', quantity: 1, price: 14500 }
        ],
        total: 14500
    }
];
