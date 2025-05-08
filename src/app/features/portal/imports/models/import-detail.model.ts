import { Product } from "../../products/models/product";

export interface ImportDetailRequest {
    productId: number;
    quantity: number;
    price: number;
}

export interface ImportDetail {
    id?: number;
    product: Product;
    quantity: number;
    price: number;
}