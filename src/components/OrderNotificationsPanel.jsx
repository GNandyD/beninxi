import {
  getOrderNotificationChannelConfig,
  getOrderNotificationStatusAppearance,
  sortOrderNotifications,
} from '@/lib/orderNotifications';

function formatNotificationDate(value) {
  if (!value) return '';

  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrderNotificationsPanel({
  notifications = [],
  title = 'Notifications client',
  emptyMessage = 'Aucune notification n’a encore été enregistrée.',
}) {
  const sortedNotifications = sortOrderNotifications(notifications);

  return (
    <div style={{ background: '#FCFCFC', border: '1px solid #EFEFEF', borderRadius: 18, padding: '18px 18px' }}>
      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 14, fontFamily: 'var(--font-sora)' }}>
        {title}
      </div>

      {!sortedNotifications.length ? (
        <div style={{ fontSize: '0.82rem', color: '#8A8A8A', lineHeight: 1.7 }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {sortedNotifications.map(notification => {
            const channel = getOrderNotificationChannelConfig(notification.channel);
            const status = getOrderNotificationStatusAppearance(notification.status);
            const recipientLabel = notification.recipient || 'destinataire manquant';
            const sentAt = notification.sent_at || notification.created_at;

            return (
              <div
                key={notification.id}
                style={{
                  background: '#fff',
                  border: '1px solid #F0F0F0',
                  borderRadius: 16,
                  padding: '14px 14px',
                }}
              >
                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0A0A0A', fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>
                      <span>{channel.icon}</span>
                      <span>{channel.label}</span>
                      <span style={{ color: '#AAA', fontWeight: 500 }}>·</span>
                      <span style={{ color: '#666', fontWeight: 500, overflowWrap: 'anywhere' }}>{recipientLabel}</span>
                    </div>
                    {notification.subject && (
                      <div style={{ fontSize: '0.78rem', color: '#333', lineHeight: 1.5 }}>
                        {notification.subject}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      padding: '6px 10px',
                      borderRadius: 999,
                      border: `1px solid ${status.border}`,
                      background: status.bg,
                      color: status.color,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {status.label}
                  </div>
                </div>

                {notification.message_text && (
                  <div style={{ fontSize: '0.76rem', color: '#666', lineHeight: 1.65, marginBottom: 8, whiteSpace: 'pre-wrap' }}>
                    {notification.message_text}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.72rem', color: '#999' }}>
                    {formatNotificationDate(sentAt)}
                  </div>
                  {notification.error_message && (
                    <div style={{ fontSize: '0.72rem', color: '#C62828', maxWidth: '100%', overflowWrap: 'anywhere' }}>
                      {notification.error_message}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
