export interface Product {
    id: number;
    name: string;
    price: number;
    quantity?: number;
}

export interface Supplier {
    id: number;
    name?: string;
    companyName?: string;
    phone?: string;
    logo?: string;
}

export interface User {
    id: number;
    fullName?: string;
    name?: string;
    email?: string;
}

export interface ImportDetail {
    id?: number;
    product: Product;
    quantity: number;
    price: number;
}

export interface Import {
    id?: number;
    supplier: Supplier;
    employee: User;
    importDetails: ImportDetail[];
    quantity: number;
    totalAmount: number;
    status: 'processing' | 'completed' | 'cancelled';
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}