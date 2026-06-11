export const FREE_SHIPPING_THRESHOLD = null;

export const deliveryZones = [
  {
    id: 'sud',
    label: 'Sud Bénin',
    emoji: '🟢',
    villes: [
      { id: 'cotonou', label: 'Cotonou', fee: 1000 },
      { id: 'akpakpa', label: 'Akpakpa', fee: 1000 },
      { id: 'fidjrosse', label: 'Fidjrossè', fee: 1200 },
      { id: 'godomey', label: 'Godomey', fee: 1200 },
      { id: 'abomey_calavi', label: 'Abomey-Calavi', fee: 1500 },
      { id: 'seme_kpodji', label: 'Sèmè-Kpodji', fee: 1500 },
      { id: 'porto_novo', label: 'Porto-Novo', fee: 2000 },
      { id: 'ouidah', label: 'Ouidah', fee: 2500 },
      { id: 'allada', label: 'Allada', fee: 2500 },
      { id: 'tori_bossito', label: 'Tori-Bossito', fee: 3000 },
    ],
  },
];

export const paymentMethods = [
  { id: 'kkiapay', label: 'Kkiapay', icon: '💳', color: '#F9A825', desc: 'Mobile Money et carte bancaire sécurisés' },
];

export const checkoutPaymentMethodIds = new Set(paymentMethods.map(method => method.id));
export const orderStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
export const orderStatusFlow = ['pending', 'confirmed', 'shipping', 'delivered'];
export const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

export const orderStatusConfig = {
  pending: { label: 'En attente', color: '#F57F17', bg: '#FFFDE7' },
  confirmed: { label: 'Confirmée', color: '#1B5E20', bg: '#F0FAF0' },
  shipping: { label: 'En livraison', color: '#0066CC', bg: '#E3F2FD' },
  delivered: { label: 'Livrée', color: '#1B5E20', bg: '#F0FAF0' },
  cancelled: { label: 'Annulée', color: '#C62828', bg: '#FFF0F0' },
};

export const paymentStatusConfig = {
  pending: { label: 'Paiement en attente', color: '#F57F17', bg: '#FFF8E1' },
  paid: { label: 'Payée', color: '#1B5E20', bg: '#F0FAF0' },
  failed: { label: 'Paiement échoué', color: '#C62828', bg: '#FFF0F0' },
  refunded: { label: 'Remboursée', color: '#0066CC', bg: '#E3F2FD' },
};

export const orderStatusIds = new Set(orderStatuses);
export const paymentStatusIds = new Set(paymentStatuses);

const adminOrderActionConfig = {
  confirm_order: {
    label: 'Confirmer',
    description: 'Valider la commande pour preparation',
    color: '#0A0A0A',
    bg: '#F5F5F5',
    border: '#E0E0E0',
  },
  mark_shipping: {
    label: 'Passer en livraison',
    description: 'Signaler que le colis est en route',
    color: '#0B5CAD',
    bg: '#EAF4FF',
    border: '#C9E0FF',
  },
  mark_delivered: {
    label: 'Marquer livree',
    description: 'Finaliser la livraison de la commande',
    color: '#1B5E20',
    bg: '#F0FAF0',
    border: '#CDE8CF',
  },
  mark_paid: {
    label: 'Marquer payee',
    description: 'Valider l encaissement du paiement',
    color: '#8A5A00',
    bg: '#FFF8E1',
    border: '#F6D78B',
  },
  mark_failed: {
    label: 'Echec paiement',
    description: 'Marquer la transaction comme echouee',
    color: '#C62828',
    bg: '#FFF0F0',
    border: '#FFCDD2',
  },
  refund_payment: {
    label: 'Rembourser',
    description: 'Indiquer qu un remboursement a ete effectue',
    color: '#0066CC',
    bg: '#E3F2FD',
    border: '#C9DDF8',
  },
  cancel_order: {
    label: 'Annuler',
    description: 'Stopper le traitement de la commande',
    color: '#C62828',
    bg: '#FFF5F5',
    border: '#FFD4D4',
  },
  reopen_order: {
    label: 'Reouvrir',
    description: 'Remettre la commande dans le circuit',
    color: '#0A0A0A',
    bg: '#F5F5F5',
    border: '#E0E0E0',
  },
};

const paymentMethodLabels = {
  kkiapay: 'Kkiapay',
  mtn: 'MTN Mobile Money',
  moov: 'Moov Money',
};

const packagePriority = { petit: 1, moyen: 2, grand: 3 };

export const packageTypeByCategory = {
  vetements: 'moyen',
  chaussures: 'moyen',
  smartphones: 'petit',
  pagnes: 'moyen',
  meubles: 'grand',
  montres: 'petit',
  sacs: 'moyen',
  colliers: 'petit',
  chaines: 'petit',
};

export function getItemsSubtotal(items = []) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + Number(item?.price || 0) * Number(item?.qty || 0), 0);
}

export function getPackageType(items = []) {
  return items
    .map(item => packageTypeByCategory[item?.category] || 'moyen')
    .reduce((selectedType, nextType) => (
      packagePriority[nextType] > packagePriority[selectedType] ? nextType : selectedType
    ), 'petit');
}

export function getZoneById(zoneId) {
  return deliveryZones.find(zone => zone.id === zoneId) || null;
}

export function getCityById(cityId) {
  return deliveryZones.flatMap(zone => zone.villes).find(city => city.id === cityId) || null;
}

export function getZoneByCityId(cityId) {
  return deliveryZones.find(zone => zone.villes.some(city => city.id === cityId)) || null;
}

export function isCityInZone(zoneId, cityId) {
  const zone = getZoneById(zoneId);
  return Boolean(zone && zone.villes.some(city => city.id === cityId));
}

export function getDeliveryBaseFee(items = [], cityId) {
  const city = getCityById(cityId);
  if (!city) return 0;
  return Number(city.fee ?? city[getPackageType(items)] ?? 0);
}

export function getDeliveryFee(items = [], cityId) {
  if (!cityId) return 0;
  return getDeliveryBaseFee(items, cityId);
}

export function getZoneLabel(zoneId) {
  return getZoneById(zoneId)?.label || zoneId || '';
}

export function getCityLabel(cityId) {
  return getCityById(cityId)?.label || cityId || '';
}

export function getLocationLabel(zoneId, cityId) {
  return getCityLabel(cityId);
}

export function getPaymentMethodLabel(methodId) {
  return paymentMethodLabels[methodId] || methodId || '';
}

export function getOrderStatusLabel(status) {
  return orderStatusConfig[status]?.label || status || '';
}

export function getPaymentStatusLabel(status) {
  return paymentStatusConfig[status]?.label || status || '';
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null)
  );
}

export function getOrderSubtotal(order) {
  const subtotal = Number(order?.subtotal);
  if (Number.isFinite(subtotal) && subtotal >= 0) return subtotal;
  return (order?.items || []).reduce((sum, item) => sum + Number(item?.price || 0) * Number(item?.qty || 0), 0);
}

export function getOrderDeliveryFee(order) {
  const deliveryFee = Number(order?.delivery_fee);
  if (Number.isFinite(deliveryFee) && deliveryFee >= 0) return deliveryFee;

  const derivedFee = Number(order?.total) - getOrderSubtotal(order);
  return Number.isFinite(derivedFee) && derivedFee > 0 ? derivedFee : 0;
}

export function getAdminOrderActionUpdate(order, actionId) {
  const status = order?.status || 'pending';
  const paymentStatus = order?.payment_status || 'pending';
  const paymentMethod = order?.payment_method || 'kkiapay';

  switch (actionId) {
    case 'confirm_order':
      return status === 'pending' ? { status: 'confirmed' } : null;
    case 'mark_shipping':
      return ['pending', 'confirmed'].includes(status)
        ? { status: 'shipping' }
        : null;
    case 'mark_delivered':
      return ['confirmed', 'shipping'].includes(status)
        ? { status: 'delivered' }
        : null;
    case 'mark_paid':
      return !['paid', 'refunded'].includes(paymentStatus) && status !== 'cancelled'
        ? compactObject({
            payment_status: 'paid',
            status: status === 'pending' ? 'confirmed' : undefined,
          })
        : null;
    case 'mark_failed':
      return paymentMethod === 'kkiapay' && !['failed', 'paid', 'refunded'].includes(paymentStatus)
        ? { payment_status: 'failed' }
        : null;
    case 'refund_payment':
      return paymentStatus === 'paid' ? { payment_status: 'refunded' } : null;
    case 'cancel_order':
      return !['delivered', 'cancelled'].includes(status)
        ? { status: 'cancelled' }
        : null;
    case 'reopen_order':
      return status === 'cancelled'
        ? { status: paymentStatus === 'paid' ? 'confirmed' : 'pending' }
        : null;
    default:
      return null;
  }
}

export function getAdminOrderQuickActions(order) {
  const status = order?.status || 'pending';
  const paymentStatus = order?.payment_status || 'pending';
  const actionIds = [];

  if (status === 'pending') {
    actionIds.push('confirm_order');
  }
  if (status === 'confirmed') {
    actionIds.push('mark_shipping');
  }
  if (status === 'shipping') {
    actionIds.push('mark_delivered');
  }
  if (!['paid', 'refunded'].includes(paymentStatus) && status !== 'cancelled') {
    actionIds.push('mark_paid');
  }
  if (paymentStatus === 'pending' && order?.payment_method === 'kkiapay' && status !== 'cancelled') {
    actionIds.push('mark_failed');
  }
  if (paymentStatus === 'paid') {
    actionIds.push('refund_payment');
  }
  if (!['delivered', 'cancelled'].includes(status)) {
    actionIds.push('cancel_order');
  }
  if (status === 'cancelled') {
    actionIds.push('reopen_order');
  }

  return actionIds
    .filter(actionId => getAdminOrderActionUpdate(order, actionId))
    .map(actionId => ({
      id: actionId,
      ...adminOrderActionConfig[actionId],
    }));
}

export function normalizeOrderItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map(item => ({
      id: item?.id,
      name: String(item?.name || '').trim(),
      price: Number(item?.price),
      img: item?.img || '',
      color: item?.color || 'Standard',
      size: item?.size || 'Standard',
      qty: Number(item?.qty),
      category: typeof item?.category === 'string' ? item.category : null,
    }))
    .filter(item => (
      item.id &&
      item.name &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      Number.isInteger(item.qty) &&
      item.qty > 0
    ));
}
