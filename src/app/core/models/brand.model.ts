export interface Brand {
    id: number;
    name: string;
    description: string;
    logoUrl: string;
    origin: string;
    website?: string;
    productCount: number;
    status: 'ACTIVE' | 'INACTIVE'
}

export interface BrandRequest {
    name: string;
    description?: string;
    logoUrl?: string;
    origin: string;
    website?: string;
    status?: string;
}

export interface DialogData {
    brand?: Brand;
}