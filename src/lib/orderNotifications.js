import {
  getLocationLabel,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '@/lib/orderUtils';

export const ORDER_WITH_EVENTS_AND_NOTIFICATIONS_SELECT = '*, order_events(*), order_notifications(*)';

const supportedEventTypes = new Set([
  'order_created',
  'confirm_order',
  'payment_confirmed',
  'payment_failed',
  'mark_paid',
  'mark_failed',
  'mark_shipping',
  'mark_delivered',
  'cancel_order',
  'refund_payment',
  'reopen_order',
]);

const notificationChannelConfig = {
  sms: { label: 'SMS', icon: '📱' },
  email: { label: 'Email', icon: '✉️' },
};

const notificationStatusConfig = {
  pending: { label: 'En attente', color: '#8A5A00', bg: '#FFF8E1', border: '#F6D78B' },
  sent: { label: 'Envoyée', color: '#1B5E20', bg: '#F0FAF0', border: '#CDE8CF' },
  failed: { label: 'Échec', color: '#C62828', bg: '#FFF0F0', border: '#FFCDD2' },
  skipped: { label: 'Ignorée', color: '#616161', bg: '#F5F5F5', border: '#E0E0E0' },
};

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

function truncateText(value, maxLength = 1500) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function formatDateTime(value) {
  if (!value) return '';

  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getBaseSiteUrl() {
  return String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').trim().replace(/\/+$/, '');
}

function getAccountUrl() {
  const siteUrl = getBaseSiteUrl();
  return siteUrl ? `${siteUrl}/compte` : '';
}

function getCustomerFirstName(order) {
  return String(order?.customer_name || '').trim().split(/\s+/).filter(Boolean)[0] || 'Bonjour';
}

function getOrderLocation(order) {
  const locationLabel = getLocationLabel(order?.zone, order?.ville);
  if (locationLabel) return locationLabel;
  return [order?.ville, order?.zone].filter(Boolean).join(' · ') || 'votre adresse de livraison';
}

function getChannelRecipient(channel, order) {
  if (channel === 'sms') return String(order?.customer_phone || '').trim();
  if (channel === 'email') return String(order?.customer_email || '').trim();
  return '';
}

function getChannelWebhookConfig(channel) {
  if (channel === 'sms') {
    return {
      url: String(process.env.ORDER_NOTIFICATION_SMS_WEBHOOK_URL || '').trim(),
      token: String(process.env.ORDER_NOTIFICATION_SMS_WEBHOOK_TOKEN || '').trim(),
    };
  }

  if (channel === 'email') {
    return {
      url: String(process.env.ORDER_NOTIFICATION_EMAIL_WEBHOOK_URL || '').trim(),
      token: String(process.env.ORDER_NOTIFICATION_EMAIL_WEBHOOK_TOKEN || '').trim(),
    };
  }

  return { url: '', token: '' };
}

function getNotificationCopy(order, event) {
  const orderNumber = order?.order_number || 'votre commande';
  const total = formatMoney(order?.total);
  const location = getOrderLocation(order);
  const paymentMethod = getPaymentMethodLabel(order?.payment_method);
  const orderStatus = getOrderStatusLabel(order?.status);
  const paymentStatus = getPaymentStatusLabel(order?.payment_status);

  switch (event?.event_type) {
    case 'order_created':
      return {
        subject: `Commande ${orderNumber} reçue`,
        headline: 'Votre commande a bien été enregistrée',
        lead: `Nous avons bien reçu votre commande ${orderNumber} pour un montant de ${total}. Livraison prévue vers ${location}.`,
        smsText: `Beninxi: commande ${orderNumber} reçue. Total ${total}. Livraison vers ${location}. Nous vous tenons informé de la suite.`,
      };
    case 'confirm_order':
      return {
        subject: `Commande ${orderNumber} confirmée`,
        headline: 'Votre commande est confirmée',
        lead: `La commande ${orderNumber} a été validée et passe en préparation.`,
        smsText: `Beninxi: votre commande ${orderNumber} est confirmée. Préparation en cours.`,
      };
    case 'payment_confirmed':
      return {
        subject: `Paiement confirmé pour ${orderNumber}`,
        headline: 'Votre paiement a été confirmé',
        lead: `Le paiement de votre commande ${orderNumber} a été confirmé via ${paymentMethod}. La commande est maintenant ${orderStatus.toLowerCase()}.`,
        smsText: `Beninxi: paiement confirmé pour ${orderNumber}. Statut commande: ${orderStatus}.`,
      };
    case 'payment_failed':
    case 'mark_failed':
      return {
        subject: `Paiement à reprendre pour ${orderNumber}`,
        headline: 'Le paiement n’a pas abouti',
        lead: `Le paiement associé à la commande ${orderNumber} a été signalé en échec. Si besoin, notre équipe peut vous aider à reprendre le règlement.`,
        smsText: `Beninxi: le paiement de ${orderNumber} n'a pas abouti. Contactez-nous si vous souhaitez relancer la commande.`,
      };
    case 'mark_paid':
      return {
        subject: `Paiement enregistré pour ${orderNumber}`,
        headline: 'Votre paiement a été enregistré',
        lead: `Le paiement de la commande ${orderNumber} a été marqué comme encaissé. Statut actuel: ${paymentStatus.toLowerCase()}.`,
        smsText: `Beninxi: paiement enregistré pour ${orderNumber}. Merci pour votre confiance.`,
      };
    case 'mark_shipping':
      return {
        subject: `Commande ${orderNumber} en livraison`,
        headline: 'Votre commande est en route',
        lead: `Votre commande ${orderNumber} est en cours de livraison vers ${location}.`,
        smsText: `Beninxi: votre commande ${orderNumber} est en livraison vers ${location}.`,
      };
    case 'mark_delivered':
      return {
        subject: `Commande ${orderNumber} livrée`,
        headline: 'Votre commande a été marquée comme livrée',
        lead: `La livraison de votre commande ${orderNumber} a été finalisée. Merci pour votre confiance.`,
        smsText: `Beninxi: votre commande ${orderNumber} a été marquée comme livrée. Merci pour votre confiance.`,
      };
    case 'cancel_order':
      return {
        subject: `Commande ${orderNumber} annulée`,
        headline: 'Votre commande a été annulée',
        lead: `Le traitement de la commande ${orderNumber} a été interrompu. Si vous souhaitez une reprise, notre équipe reste disponible.`,
        smsText: `Beninxi: votre commande ${orderNumber} a été annulée. Contactez-nous si vous souhaitez la relancer.`,
      };
    case 'refund_payment':
      return {
        subject: `Remboursement enregistré pour ${orderNumber}`,
        headline: 'Un remboursement a été enregistré',
        lead: `Le remboursement lié à la commande ${orderNumber} a été marqué comme effectué.`,
        smsText: `Beninxi: un remboursement a été enregistré pour la commande ${orderNumber}.`,
      };
    case 'reopen_order':
      return {
        subject: `Commande ${orderNumber} rouverte`,
        headline: 'Votre commande repart en traitement',
        lead: `La commande ${orderNumber} a été rouverte et réintègre le circuit de traitement.`,
        smsText: `Beninxi: votre commande ${orderNumber} a été rouverte et repart en traitement.`,
      };
    default:
      return {
        subject: `Mise à jour de votre commande ${orderNumber}`,
        headline: 'Votre commande a été mise à jour',
        lead: `La commande ${orderNumber} a été mise à jour. Statut commande: ${orderStatus}. Statut paiement: ${paymentStatus}.`,
        smsText: `Beninxi: votre commande ${orderNumber} a été mise à jour. Commande: ${orderStatus}. Paiement: ${paymentStatus}.`,
      };
  }
}

function buildEmailHtml(order, event, copy) {
  const accountUrl = getAccountUrl();
  const summaryRows = [
    ['Commande', order?.order_number],
    ['Montant total', formatMoney(order?.total)],
    ['Paiement', getPaymentMethodLabel(order?.payment_method)],
    ['Statut commande', getOrderStatusLabel(order?.status)],
    ['Statut paiement', getPaymentStatusLabel(order?.payment_status)],
    ['Livraison', getOrderLocation(order)],
    ['Dernière mise à jour', formatDateTime(event?.created_at)],
  ].filter(([, value]) => value);

  const summaryHtml = summaryRows.map(([label, value]) => (
    `<tr>
      <td style="padding:8px 12px;color:#666;font-size:13px;border-bottom:1px solid #f1f1f1;">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;color:#0A0A0A;font-size:13px;font-weight:600;border-bottom:1px solid #f1f1f1;">${escapeHtml(value)}</td>
    </tr>`
  )).join('');

  const descriptionHtml = event?.description
    ? `<p style="margin:0 0 18px;color:#555;line-height:1.7;">${escapeHtml(event.description)}</p>`
    : '';
  const actionHtml = accountUrl
    ? `<a href="${escapeHtml(accountUrl)}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#0A0A0A;color:#fff;text-decoration:none;font-weight:700;">Suivre ma commande</a>`
    : '';

  return `
    <div style="background:#F7F7F7;padding:24px;font-family:Arial,sans-serif;color:#0A0A0A;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:20px;padding:28px;border:1px solid #ECECEC;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;color:#1B5E20;margin-bottom:12px;">BENINXI</div>
        <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;">${escapeHtml(copy.headline)}</h1>
        <p style="margin:0 0 10px;color:#444;line-height:1.7;">Bonjour ${escapeHtml(getCustomerFirstName(order))},</p>
        <p style="margin:0 0 18px;color:#444;line-height:1.7;">${escapeHtml(copy.lead)}</p>
        ${descriptionHtml}
        <table style="width:100%;border-collapse:collapse;background:#FAFAFA;border-radius:16px;overflow:hidden;margin:0 0 22px;">
          <tbody>${summaryHtml}</tbody>
        </table>
        ${actionHtml}
      </div>
    </div>
  `;
}

function buildNotificationMessage(channel, order, event) {
  const copy = getNotificationCopy(order, event);
  return {
    subject: copy.subject,
    text: channel === 'sms'
      ? copy.smsText
      : `${copy.headline}\n\nBonjour ${getCustomerFirstName(order)},\n\n${copy.lead}${event?.description ? `\n\n${event.description}` : ''}\n\nCommande: ${order?.order_number}\nTotal: ${formatMoney(order?.total)}\nLivraison: ${getOrderLocation(order)}\nPaiement: ${getPaymentMethodLabel(order?.payment_method)}\nStatut commande: ${getOrderStatusLabel(order?.status)}\nStatut paiement: ${getPaymentStatusLabel(order?.payment_status)}${getAccountUrl() ? `\n\nSuivi: ${getAccountUrl()}` : ''}`,
    html: channel === 'email' ? buildEmailHtml(order, event, copy) : '',
  };
}

function buildNotificationPayload(channel, recipient, order, event, message) {
  return compactObject({
    source: 'beninxi',
    channel,
    recipient,
    customer: compactObject({
      name: order?.customer_name || '',
      phone: order?.customer_phone || '',
      email: order?.customer_email || '',
    }),
    order: compactObject({
      id: order?.id,
      order_number: order?.order_number,
      subtotal: order?.subtotal,
      delivery_fee: order?.delivery_fee,
      total: order?.total,
      payment_method: order?.payment_method,
      payment_status: order?.payment_status,
      status: order?.status,
      address: order?.address,
      zone: order?.zone,
      ville: order?.ville,
      items: order?.items,
    }),
    event: compactObject({
      id: event?.id,
      event_type: event?.event_type,
      title: event?.title,
      description: event?.description,
      actor_type: event?.actor_type,
      actor_label: event?.actor_label,
      from_status: event?.from_status,
      to_status: event?.to_status,
      from_payment_status: event?.from_payment_status,
      to_payment_status: event?.to_payment_status,
      created_at: event?.created_at,
      metadata: event?.metadata,
    }),
    message: compactObject({
      subject: message?.subject,
      text: message?.text,
      html: message?.html,
    }),
    links: compactObject({
      account_url: getAccountUrl(),
    }),
  });
}

function getSkipReason({ recipient, webhookUrl, channel }) {
  if (!recipient) {
    return `Canal ${channel === 'sms' ? 'SMS' : 'email'} ignoré: destinataire manquant.`;
  }
  if (!webhookUrl) {
    return `Canal ${channel === 'sms' ? 'SMS' : 'email'} ignoré: webhook non configuré.`;
  }
  return '';
}

async function readResponseBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return truncateText(text, 2000);
  }
}

async function sendWebhookNotification(url, token, payload) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: compactObject({
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      }),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    const responseBody = await readResponseBody(response);
    const providerResponse = compactObject({
      status: response.status,
      status_text: response.statusText,
      body: responseBody,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Webhook ${payload.channel} en erreur (${response.status}).`,
        providerResponse,
      };
    }

    return {
      ok: true,
      providerResponse,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Erreur réseau inconnue.',
      providerResponse: {},
    };
  }
}

async function processNotificationChannel(supabase, order, event, channel) {
  const recipient = getChannelRecipient(channel, order);
  const { url: webhookUrl, token } = getChannelWebhookConfig(channel);
  const message = buildNotificationMessage(channel, order, event);
  const payload = buildNotificationPayload(channel, recipient, order, event, message);
  const skipReason = getSkipReason({ recipient, webhookUrl, channel });
  const now = new Date().toISOString();

  const { data: notification, error: insertError } = await supabase
    .from('order_notifications')
    .insert({
      order_id: order.id,
      order_event_id: event.id,
      order_number: order.order_number,
      channel,
      provider: 'webhook',
      recipient: recipient || null,
      status: skipReason ? 'skipped' : 'pending',
      subject: message.subject || null,
      message_text: message.text || null,
      payload,
      provider_response: {},
      error_message: skipReason || null,
      updated_at: now,
    })
    .select('*')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return { data: null, error: null, duplicate: true };
    }

    return { data: null, error: insertError, duplicate: false };
  }

  if (skipReason) {
    return { data: notification, error: null, duplicate: false };
  }

  const sendResult = await sendWebhookNotification(webhookUrl, token, payload);
  const notificationUpdate = sendResult.ok
    ? {
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider_response: sendResult.providerResponse,
        error_message: null,
        updated_at: new Date().toISOString(),
      }
    : {
        status: 'failed',
        provider_response: sendResult.providerResponse,
        error_message: truncateText(sendResult.error, 300),
        updated_at: new Date().toISOString(),
      };

  const { data: updatedNotification } = await supabase
    .from('order_notifications')
    .update(notificationUpdate)
    .eq('id', notification.id)
    .select('*')
    .single();

  return {
    data: updatedNotification || { ...notification, ...notificationUpdate },
    error: sendResult.ok ? null : new Error(sendResult.error),
    duplicate: false,
  };
}

export function sortOrderNotifications(notifications = []) {
  return [...(Array.isArray(notifications) ? notifications : [])].sort((left, right) => (
    new Date(right.sent_at || right.created_at).getTime() - new Date(left.sent_at || left.created_at).getTime()
  ));
}

export function withSortedOrderNotifications(orders = []) {
  return (Array.isArray(orders) ? orders : []).map(order => ({
    ...order,
    order_notifications: sortOrderNotifications(order?.order_notifications || []),
  }));
}

export function getOrderNotificationStatusAppearance(status) {
  return notificationStatusConfig[status] || {
    label: status || 'Inconnu',
    color: '#0A0A0A',
    bg: '#F5F5F5',
    border: '#E0E0E0',
  };
}

export function getOrderNotificationChannelConfig(channel) {
  return notificationChannelConfig[channel] || {
    label: channel || 'Canal',
    icon: '🔔',
  };
}

export async function dispatchOrderNotifications(supabase, { order, event }) {
  if (!supabase || !order?.id || !order?.order_number || !event?.id || !supportedEventTypes.has(event.event_type)) {
    return { data: [], error: null };
  }

  const channels = ['sms', 'email'];
  const results = await Promise.all(
    channels.map(channel => processNotificationChannel(supabase, order, event, channel))
  );

  return {
    data: results.map(result => result.data).filter(Boolean),
    error: results.find(result => result.error)?.error || null,
  };
}
