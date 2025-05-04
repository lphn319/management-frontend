export interface Supplier {
    id: number | null;
    companyName: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
    logo?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    categories?: Category[];
}

export interface Category {
    id: number;
    name: string;
}

export interface SupplierRequest {
    companyName: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
    logo?: string;
    status?: string;
    categoryIds?: number[];
}

export interface DialogData {
    supplier?: Supplier;
    categories?: Category[];
}