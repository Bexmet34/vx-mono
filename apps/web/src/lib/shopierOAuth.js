/**
 * Shopier OAuth 2.0 - Client Credentials Token Yöneticisi
 */

let cachedToken = null;
let tokenExpiresAt = 0;

export async function getShopierAccessToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt - 30_000) {
    return cachedToken;
  }

  const clientId     = process.env.SHOPIER_CLIENT_ID;
  const clientSecret = process.env.SHOPIER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SHOPIER_CLIENT_ID veya SHOPIER_CLIENT_SECRET eksik');
  }

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     clientId,
    client_secret: clientSecret,
    scope:         'products:read orders:read shop:read',
  });

  const res = await fetch('https://api.shopier.com/oauth/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[Shopier OAuth] Token alınamadı:', res.status, err);
    throw new Error(`Shopier OAuth token hatası: ${res.status}`);
  }

  const data = await res.json();
  cachedToken    = data.access_token;
  tokenExpiresAt = now + (data.expires_in ?? 3600) * 1000;

  return cachedToken;
}

export function verifyShopierWebhookToken(receivedToken) {
  const webhookToken = process.env.SHOPIER_WEBHOOK_TOKEN;
  if (!webhookToken) return false;
  return receivedToken === webhookToken;
}
