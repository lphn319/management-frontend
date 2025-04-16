export interface Brand {
    id: number;
    name: string;
    description: string;
    logoUrl: string;
    origin: string;
    website?: string;
    productCount: number;
    status: 'active' | 'inactive';
}

export interface DialogData {
    brand?: Brand;
}