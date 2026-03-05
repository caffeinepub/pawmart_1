import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: number;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    total: number;
    userId: Principal;
    createdAt: bigint;
    items: Array<OrderItem>;
}
export interface UserProfile {
    principal: Principal;
    name: string;
    role: string;
    email: string;
}
export interface Product {
    id: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    price: number;
}
export enum OrderStatus {
    shipped = "shipped",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, description: string, price: number, category: string, imageUrl: string, stock: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimFirstAdmin(): Promise<boolean>;
    deleteProduct(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllProductsByCategory(category: string): Promise<Array<Product>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyOrders(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(items: Array<OrderItem>): Promise<bigint | null>;
    registerUserProfile(name: string, email: string): Promise<void>;
    resetAndClaimAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(id: bigint, name: string, description: string, price: number, category: string, imageUrl: string, stock: bigint): Promise<void>;
}
