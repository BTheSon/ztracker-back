export interface Order {
    id: string;
    address: string;
    phone: string;
    img_url?: string;
    raw_text?: string;
    createdAt: Date;
}