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