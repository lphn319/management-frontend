export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl: string;
    brand: {
        id: number;
        name: string;
    };
    categories: {
        id: number;
        name: string;
    }[];
}

export interface ProductRequest {
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl: string;
    brandId: number;
    categoryIds: number[];
}

export interface DialogData {
    product?: Product;
    brands: { id: number; name: string }[];
    categories: { id: number; name: string }[];
    viewOnly?: boolean;
}