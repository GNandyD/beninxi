export const KKIAPAY_SCRIPT_URL = 'https://cdn.kkiapay.me/k.js';

export function getKkiapayPublicKey() {
  return process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '';
}

export function isKkiapaySandbox() {
  return String(process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX || '').toLowerCase() === 'true';
}

export function getKkiapayWebhookSecret() {
  return process.env.KKIAPAY_WEBHOOK_SECRET || '';
}

export function normalizeKkiapayPhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

export function getKkiapayPaymentMethods() {
  return ['momo', 'card'];
}

export function isKkiapaySuccessPayload(payload) {
  return payload?.isPaymentSucces === true || payload?.event === 'transaction.success';
}

export function isKkiapayFailurePayload(payload) {
  return payload?.isPaymentSucces === false || payload?.event === 'transaction.failed';
}

export function getKkiapayTransactionId(payload) {
  return payload?.transactionId || payload?.data?.transactionId || null;
}
