import api from './client';

export async function listSales(params: Record<string, unknown>) {
  const res = await api.get('/sales', { params });
  return res.data;
}

export async function getSale(id: number) {
  const res = await api.get(`/sales/${id}`);
  return res.data.data;
}

export async function getSalePaginatedDetails(id: number, tab: string, page = 1, perPage = 10) {
  const res = await api.get(`/sales/${id}/details`, { params: { tab, page, perPage } });
  return res.data;
}

export async function createSale(data: Record<string, unknown>) {
  const res = await api.post('/sales', data);
  return res.data.data;
}

export async function voidSale(id: number, reason: string) {
  const res = await api.post(`/sales/${id}/void`, { reason });
  return res.data.data;
}

export async function registerPayment(saleId: number, data: Record<string, unknown>) {
  const res = await api.post(`/sales/${saleId}/payments`, data);
  return res.data.data;
}

export async function deletePayment(saleId: number, paymentId: string, body?: Record<string, unknown>) {
  const res = await api.delete(`/sales/${saleId}/payments/${paymentId}`, { data: body });
  return res.data.data;
}

export async function getSalePayments(saleId: number) {
  const res = await api.get(`/sales/${saleId}/payments`);
  return res.data.data;
}

export async function sendVoucher(saleId: number, pdfBase64: string) {
  const res = await api.post(`/sales/${saleId}/send-voucher`, { pdfBase64 });
  return res.data.data;
}

export async function updateReviewStatus(id: number, isReviewed: boolean) {
  const res = await api.patch(`/sales/${id}/review-status`, { isReviewed });
  return res.data.data;
}

export async function createSiigoInvoice(id: number) {
  const res = await api.post(`/sales/${id}/invoice`);
  return res.data;
}
