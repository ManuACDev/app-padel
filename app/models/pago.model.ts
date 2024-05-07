export interface Pago {
    amount: number;
    created: string;
    paymentIntentId: string;
    token: string;
    uid: string;
    active: boolean;
}