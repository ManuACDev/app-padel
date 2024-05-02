export interface Pago {
    amount: number;
    created: string;
    paymentIntentId: string;
    token: string;
    userId: string;
}