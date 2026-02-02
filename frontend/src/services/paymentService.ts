import { apiClient } from '@/services/api-client';

export interface Payment {
    id: string;
    description?: string;
    amount: number;
    status: string;
    date?: string;
    method?: string;
    currency?: string;
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'captured' | 'refunded' | 'cancelled';
    customerEmail?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export interface CreateIntentData {
    amount: number;
    currency?: string;
    customerEmail?: string;
    metadata?: Record<string, unknown>;
}

export interface Transaction {
    id: string;
    type: string;
    amount: number;
    currency: string;
    description?: string;
    createdAt: string;
}

export interface Wallet {
    balance: number;
    currency: string;
}

export const paymentService = {
    // Legacy endpoints
    getPayments: async ({ page = 1, limit = 50 } = {}): Promise<Payment[]> => {
        const q = `?page=${page}&limit=${limit}`;
        return apiClient.request(`/payments/transactions${q}`) as Promise<Payment[]>;
    },

    getPayment: async (id: string): Promise<Payment> => {
        return apiClient.request(`/payments/transactions/${id}`) as Promise<Payment>;
    },

    // Payment intents (Stripe-like)
    createIntent: async (data: CreateIntentData): Promise<PaymentIntent> => {
        return apiClient.request('/payments/intents', {
            method: 'POST',
            body: JSON.stringify(data),
        }) as Promise<PaymentIntent>;
    },

    capturePayment: async (intentId: string): Promise<PaymentIntent> => {
        return apiClient.request(`/payments/intents/${intentId}/capture`, {
            method: 'POST',
        }) as Promise<PaymentIntent>;
    },

    captureCrypto: async (intentId: string, txHash: string, tokenAddress?: string): Promise<PaymentIntent> => {
        return apiClient.request(`/payments/intents/${intentId}/crypto/capture`, {
            method: 'POST',
            body: JSON.stringify({ txHash, tokenAddress }),
        }) as Promise<PaymentIntent>;
    },

    refundPayment: async (intentId: string): Promise<PaymentIntent> => {
        return apiClient.request(`/payments/intents/${intentId}/refund`, {
            method: 'POST',
        }) as Promise<PaymentIntent>;
    },

    // Wallet and transactions
    getWallet: async (): Promise<Wallet> => {
        return apiClient.request('/payments/wallet') as Promise<Wallet>;
    },

    getTransactions: async (): Promise<Transaction[]> => {
        return apiClient.request('/payments/transactions') as Promise<Transaction[]>;
    },
};

