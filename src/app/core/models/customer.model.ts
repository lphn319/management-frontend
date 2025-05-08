export interface Customer {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    membership: string;
    points: number;
    orderCount: number;
    totalSpent: number;
    status: 'active' | 'inactive';
    registeredAt: Date;
}

export interface CustomerStats {
    total: number;
    active: number;
    orders: number;
    revenue: number;
}

export interface DialogData {
    customer?: Customer;
    viewOnly?: boolean;
}