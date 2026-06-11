import {
  getOrderEventAppearance,
  sortOrderEvents,
} from '@/lib/orderEvents';

function formatEventDate(value) {
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActorText(event) {
  if (event?.actor_label) {
    return event.actor_type === 'admin'
      ? `Par ${event.actor_label}`
      : event.actor_label;
  }

  if (event?.actor_type === 'admin') return 'Par l’équipe';
  if (event?.actor_type === 'payment') return 'Passerelle de paiement';
  if (event?.actor_type === 'customer') return 'Action client';
  return 'Système';
}

export default function OrderTimeline({
  events = [],
  title = 'Historique',
  emptyMessage = 'Aucun événement enregistré pour le moment.',
}) {
  const sortedEvents = sortOrderEvents(events);

  return (
    <div style={{ background: '#F8F8F8', borderRadius: 18, padding: '20px 22px' }}>
      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0A0A0A', marginBottom: 16, fontFamily: 'var(--font-sora)' }}>
        {title}
      </div>

      {sortedEvents.length === 0 ? (
        <div style={{ color: '#999', fontSize: '0.82rem', lineHeight: 1.6 }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedEvents.map(event => {
            const appearance = getOrderEventAppearance(event.event_type);

            return (
              <div
                key={event.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr',
                  gap: 12,
                  alignItems: 'start',
                  paddingBottom: 12,
                  borderBottom: '1px solid #ECECEC',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: appearance.bg,
                    color: appearance.color,
                    border: `1px solid ${appearance.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  {appearance.icon}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, color: '#0A0A0A', fontSize: '0.85rem' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#999', flexShrink: 0 }}>
                      {formatEventDate(event.created_at)}
                    </div>
                  </div>
                  {event.description && (
                    <div style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: 4 }}>
                      {event.description}
                    </div>
                  )}
                  <div style={{ color: '#AAA', fontSize: '0.72rem', lineHeight: 1.5 }}>
                    {getActorText(event)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
