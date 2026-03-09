import { apiClient } from "./axios";

export const paymentApi = {
  createPaymentIntent: async (orderId: string, amount: number, cookId: string) => {
    const { data } = await apiClient.post("/payments/create-intent", {
      orderId,
      amount,
      cookId,
    });
    return data.data;
  },

  confirmPayment: async (transactionId: string) => {
    const { data } = await apiClient.post("/payments/confirm", { transactionId });
    return data.data;
  },

  getTransaction: async (orderId: string) => {
    const { data } = await apiClient.get(`/payments/transaction/${orderId}`);
    return data.data;
  },

  getPaymentHistory: async () => {
    const { data } = await apiClient.get("/payments/history");
    return data.data;
  },
};

export const payoutApi = {
  createConnectAccount: async (email: string) => {
    const { data } = await apiClient.post("/payouts/connect-account", { email });
    return data.data;
  },

  getEarnings: async (startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get("/payouts/earnings", {
      params: { startDate, endDate },
    });
    return data.data;
  },

  triggerPayout: async (periodStart: string, periodEnd: string) => {
    const { data } = await apiClient.post("/payouts/trigger", {
      periodStart,
      periodEnd,
    });
    return data.data;
  },

  getPayoutHistory: async () => {
    const { data } = await apiClient.get("/payouts/history");
    return data.data;
  },
};
