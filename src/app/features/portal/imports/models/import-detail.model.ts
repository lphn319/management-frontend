export interface ImportDetailRequest {
    productId: number;  // Đảm bảo là number, không phải number | null
    quantity: number;
    price: number;
}