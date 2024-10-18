export type Product = {
    id?: number;
    product_name: string;
    seller_id: number;
    amount_available: number;
    cost: number;
}

export type User = {
    id: number,
    username: string,
    role: 'buyer' | 'seller';
    deposit?: number;
}