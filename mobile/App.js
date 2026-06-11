import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  StatusBar as NativeStatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KkiapayProvider, useKkiapay } from '@kkiapay-org/react-native-sdk';
import { categories, demoProducts } from './src/data/catalog';
import { isSupabaseConfigured, supabase } from './src/lib/supabase';

const CART_STORAGE_KEY = 'beninxi.mobile.cart.v1';
const FAVORITES_STORAGE_KEY = 'beninxi.mobile.favorites.v1';
const ADDRESSES_STORAGE_KEY = 'beninxi.mobile.addresses.v1';
const SEEN_EVENTS_STORAGE_KEY = 'beninxi.mobile.seenEvents.v1';
const SEARCH_HISTORY_STORAGE_KEY = 'beninxi.mobile.searchHistory.v1';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
const KKIAPAY_PUBLIC_KEY = process.env.EXPO_PUBLIC_KKIAPAY_PUBLIC_KEY || '';
const KKIAPAY_SANDBOX = String(process.env.EXPO_PUBLIC_KKIAPAY_SANDBOX || '').toLowerCase() === 'true';
const WHATSAPP_SUPPORT_PHONE = '2290146629473';
const beninxiLogo = require('./assets/beninxi-logo.png');
const green = '#1B5E20';
const red = '#C62828';
const gold = '#F9A825';
const black = '#0A0A0A';
const ink = '#111111';
const paper = '#F5F5F7';
const surface = '#FFFFFF';
const surfaceSoft = '#FAFAFC';
const line = '#E7E7EC';
const muted = '#77777F';
const mutedLight = '#A7A7AE';
const radius = 22;
const radiusLg = 30;
const shadowSoft = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 10 },
  elevation: 4,
};
const shadowLift = {
  shadowColor: '#000',
  shadowOpacity: 0.13,
  shadowRadius: 34,
  shadowOffset: { width: 0, height: 18 },
  elevation: 8,
};
const androidTopInset = Platform.OS === 'android' ? NativeStatusBar.currentHeight || 24 : 0;

const deliveryZones = [
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

const paymentMethod = { id: 'kkiapay', label: 'Kkiapay', icon: 'K', desc: 'Mobile Money ou carte bancaire' };

const appSteps = [
  { id: 'choose', number: '1', title: 'Sélectionne', text: 'Parcours une sélection vérifiée et choisis ton article.' },
  { id: 'cart', number: '2', title: 'Confirme', text: 'Vérifie ton panier, ta ville et ton adresse de livraison.' },
  { id: 'pay', number: '3', title: 'Règle', text: 'Paie en toute sécurité avec Kkiapay.' },
  { id: 'receive', number: '4', title: 'Reçois', text: 'BéninXi prépare la commande et coordonne la livraison.' },
];

const sortOptions = [
  { id: 'popular', label: 'Populaires' },
  { id: 'price_asc', label: 'Prix +' },
  { id: 'price_desc', label: 'Prix -' },
  { id: 'rating', label: 'Mieux notés' },
  { id: 'newest', label: 'Nouveautés' },
];

const orderStatusFlow = ['pending', 'confirmed', 'shipping', 'delivered'];

const orderStatusConfig = {
  pending: { label: 'En attente', color: '#F57F17', bg: '#FFFDE7' },
  confirmed: { label: 'Confirmée', color: green, bg: '#F0FAF0' },
  shipping: { label: 'En livraison', color: '#0066CC', bg: '#E3F2FD' },
  delivered: { label: 'Livrée', color: green, bg: '#F0FAF0' },
  cancelled: { label: 'Annulée', color: red, bg: '#FFF0F0' },
};

const paymentStatusConfig = {
  pending: { label: 'Paiement en attente', color: '#F57F17', bg: '#FFF8E1' },
  paid: { label: 'Payée', color: green, bg: '#F0FAF0' },
  failed: { label: 'Paiement échoué', color: red, bg: '#FFF0F0' },
  refunded: { label: 'Remboursée', color: '#0066CC', bg: '#E3F2FD' },
};

const eventAppearance = {
  order_created: { icon: 'B', color: green, bg: '#F0FAF0' },
  payment_confirmed: { icon: '✓', color: green, bg: '#F0FAF0' },
  payment_failed: { icon: '!', color: red, bg: '#FFF0F0' },
  order_updated: { icon: '↻', color: black, bg: '#F5F5F5' },
  confirm_order: { icon: '✓', color: green, bg: '#F0FAF0' },
  mark_shipping: { icon: '→', color: '#0066CC', bg: '#E3F2FD' },
  mark_delivered: { icon: '✓', color: green, bg: '#F0FAF0' },
  mark_paid: { icon: '✓', color: '#8A5A00', bg: '#FFF8E1' },
  mark_failed: { icon: '!', color: red, bg: '#FFF0F0' },
  refund_payment: { icon: '↩', color: '#0066CC', bg: '#E3F2FD' },
  cancel_order: { icon: '×', color: red, bg: '#FFF0F0' },
  reopen_order: { icon: '↻', color: black, bg: '#F5F5F5' },
  order_confirmed: { icon: '✓', color: green, bg: '#F0FAF0' },
  order_shipping: { icon: '→', color: '#0066CC', bg: '#E3F2FD' },
  order_delivered: { icon: '✓', color: green, bg: '#F0FAF0' },
  order_cancelled: { icon: '×', color: red, bg: '#FFF0F0' },
  order_refunded: { icon: '↩', color: '#0066CC', bg: '#E3F2FD' },
};

const packageTypeByCategory = {
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

const packagePriority = { petit: 1, moyen: 2, grand: 3 };
const searchAliases = {
  phone: 'smartphone telephone portable android iphone samsung tecno infinix',
  phones: 'smartphone telephone portable android iphone samsung tecno infinix',
  telephone: 'smartphone phone portable android iphone samsung tecno infinix',
  téléphone: 'smartphone phone portable android iphone samsung tecno infinix',
  tissu: 'pagne wax textile coton',
  tissus: 'pagne wax textile coton',
  habit: 'vetements robe chemise style',
  habits: 'vetements robe chemise style',
  vêtement: 'vetements robe chemise style',
  chaussure: 'chaussures sneakers sandales',
  bijoux: 'colliers chaines montre accessoires',
  sac: 'sacs femme main bandouliere portefeuille',
  sacs: 'sacs femme main bandouliere portefeuille',
  iphone: 'smartphones apple ios reconditionne',
};

function fmt(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getSearchTerms(value) {
  return normalizeSearchText(value)
    .split(/\s+/)
    .filter(Boolean)
    .flatMap(term => [term, ...(searchAliases[term]?.split(/\s+/) || [])]);
}

function getProductSearchText(product) {
  const categoryLabel = categories.find(item => item.id === product?.category)?.label || '';
  return normalizeSearchText([
    product?.name,
    product?.seller,
    product?.category,
    categoryLabel,
    product?.badge,
    product?.description,
  ].filter(Boolean).join(' '));
}

function getSearchScore(product, searchTerms = []) {
  if (!searchTerms.length) return 1;

  const name = normalizeSearchText(product?.name);
  const seller = normalizeSearchText(product?.seller);
  const category = normalizeSearchText(product?.category);
  const haystack = getProductSearchText(product);

  return searchTerms.reduce((score, term) => {
    if (name === term || category === term) return score + 10;
    if (name.startsWith(term)) return score + 8;
    if (name.includes(term)) return score + 5;
    if (category.includes(term)) return score + 4;
    if (seller.includes(term)) return score + 3;
    if (haystack.includes(term)) return score + 2;
    return score;
  }, 0);
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function getKkiapayTransactionId(payload) {
  return payload?.transactionId || payload?.data?.transactionId || payload?.transaction_id || null;
}

function getLineKey(item) {
  return `${item.id}::${item.color || 'Standard'}::${item.size || 'Standard'}`;
}

function getPackageType(items = []) {
  return items
    .map(item => packageTypeByCategory[item?.category] || 'moyen')
    .reduce((selectedType, nextType) => (
      packagePriority[nextType] > packagePriority[selectedType] ? nextType : selectedType
    ), 'petit');
}

function getCityById(cityId) {
  return deliveryZones.flatMap(zone => zone.villes).find(city => city.id === cityId) || null;
}

function getZoneById(zoneId) {
  return deliveryZones.find(zone => zone.id === zoneId) || null;
}

function getDeliveryFee(items = [], cityId) {
  if (!cityId || !items.length) return 0;

  const city = getCityById(cityId);
  return city ? Number(city.fee ?? city[getPackageType(items)] ?? 0) : 0;
}

function getLocationLabel(zoneId, cityId) {
  return getCityById(cityId)?.label || '';
}

function getProductStock(product) {
  const stock = Number(product?.stock ?? product?.quantity ?? product?.stock_quantity);
  return Number.isFinite(stock) ? stock : null;
}

function isProductAvailable(product) {
  if (product?.available === false || product?.is_available === false) return false;
  const stock = getProductStock(product);
  return stock === null || stock > 0;
}

function getAvailability(product) {
  const stock = getProductStock(product);
  const available = isProductAvailable(product);

  if (!available) {
    return { label: 'Indisponible', detail: 'Contacte BéninXi pour une alternative', tone: 'danger' };
  }
  if (stock === null) {
    return { label: 'Disponible', detail: 'Disponibilité confirmée avant paiement', tone: 'success' };
  }
  if (stock <= 2) {
    return { label: 'Stock faible', detail: `${stock} restant${stock > 1 ? 's' : ''}`, tone: 'warning' };
  }
  return { label: 'En stock', detail: `${stock} disponible${stock > 1 ? 's' : ''}`, tone: 'success' };
}

function getOrderSubtotal(order) {
  const subtotal = Number(order?.subtotal);
  if (Number.isFinite(subtotal) && subtotal >= 0) return subtotal;
  return (order?.items || []).reduce((sum, item) => sum + Number(item?.price || 0) * Number(item?.qty || 0), 0);
}

function getOrderDeliveryFee(order) {
  const deliveryFee = Number(order?.delivery_fee);
  if (Number.isFinite(deliveryFee) && deliveryFee >= 0) return deliveryFee;
  const derived = Number(order?.total || 0) - getOrderSubtotal(order);
  return Number.isFinite(derived) && derived > 0 ? derived : 0;
}

function sortOrderEvents(events = []) {
  return [...events].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function mergeProducts(remoteProducts = [], fallbackProducts = []) {
  const productsById = new Map();

  fallbackProducts.forEach(product => {
    productsById.set(String(product.id), product);
  });

  remoteProducts.forEach(product => {
    if (!product?.id) return;
    productsById.set(String(product.id), product);
  });

  return Array.from(productsById.values()).filter(product => (
    product?.name && product?.category && Number(product?.price || 0) > 0
  ));
}

function getRelatedProducts(product, products = []) {
  if (!product) return [];
  const productPrice = Number(product.price || 0);
  const productRating = Number(product.rating || 0);

  return products
    .filter(item => item.id !== product.id)
    .map(item => {
      const itemPrice = Number(item.price || 0);
      const sameCategory = item.category === product.category;
      const closePrice = productPrice > 0 && itemPrice > 0
        ? Math.max(0, 1 - Math.abs(itemPrice - productPrice) / productPrice)
        : 0;
      const ratingBoost = Math.max(0, Number(item.rating || 0) - productRating + 1);
      const popularity = Math.min(Number(item.reviews || item.sold || 0) / 50, 2);

      return {
        product: item,
        score: (sameCategory ? 8 : 0) + closePrice * 3 + ratingBoost + popularity,
      };
    })
    .filter(item => item.score > 1.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(item => item.product);
}

function getProductDescription(product) {
  if (product?.description) return product.description;

  const categoryDescriptions = {
    smartphones: `${product.name} est sélectionné pour les clients qui veulent un téléphone fiable, prêt pour les appels, WhatsApp, photos et paiements mobiles. Vérifie la disponibilité exacte avec BéninXi avant validation.`,
    pagnes: `${product.name} est un tissu choisi pour les sorties, cérémonies, tenues de ville ou créations sur mesure. La couleur et le motif peuvent être confirmés avec BéninXi avant paiement.`,
    vetements: `${product.name} est une pièce pensée pour un usage quotidien avec un style simple et soigné. Demande la taille disponible sur WhatsApp si tu veux confirmer avant commande.`,
    chaussures: `${product.name} convient aux sorties et au quotidien. La pointure disponible peut être confirmée rapidement avec l’équipe BéninXi.`,
    meubles: `${product.name} est proposé pour équiper la maison avec une livraison adaptée selon la ville. Les dimensions exactes peuvent être confirmées avant achat.`,
    montres: `${product.name} est un accessoire élégant pour compléter une tenue professionnelle ou casual.`,
    sacs: `${product.name} est sélectionné pour compléter une tenue avec une touche chic et pratique. Les dimensions et couleurs disponibles peuvent être confirmées avec BéninXi.`,
    colliers: `${product.name} est un bijou sélectionné pour offrir ou compléter une tenue avec une touche raffinée.`,
    chaines: `${product.name} est un accessoire discret et facile à porter au quotidien.`,
  };

  return categoryDescriptions[product?.category] || `${product.name} est sélectionné pour le marketplace BéninXi. Tu peux vérifier les détails avec notre support avant de confirmer la commande.`;
}

function getOrderActivities(orders = []) {
  return orders.flatMap(order => (
    (order.order_events || []).map(event => ({
      ...event,
      order_id: order.id,
      order_number: order.order_number,
      order_total: order.total,
      order_status: order.status,
      payment_status: order.payment_status,
    }))
  )).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function createDefaultAddress() {
  return {
    id: 'home',
    label: 'Domicile',
    adresse: '',
    zone: 'sud',
    ville: 'cotonou',
    default: true,
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function mapRemoteAddress(row) {
  return {
    id: row.id,
    label: row.label || 'Adresse',
    adresse: row.address || '',
    zone: 'sud',
    ville: row.ville || 'cotonou',
    default: Boolean(row.is_default),
  };
}

const ProductCard = memo(function ProductCard({ item, onAdd, onOpen, onToggleFavorite, favorite }) {
  const discount = item.old_price ? Math.round((1 - item.price / item.old_price) * 100) : 0;
  const availability = getAvailability(item);
  const available = availability.tone !== 'danger';

  return (
    <Pressable onPress={() => onOpen(item)} style={[styles.card, !available && styles.cardUnavailable]}>
      <Pressable onPress={event => { event.stopPropagation(); onToggleFavorite(item); }} style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}>
        <Text style={styles.favoriteButtonText}>{favorite ? '♥' : '♡'}</Text>
      </Pressable>
      <Image source={{ uri: item.img }} alt={item.name} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardMetaRow}>
          <Text numberOfLines={1} style={styles.seller}>Sélection BéninXi</Text>
          {discount > 0 ? <Text style={styles.discount}>-{discount}%</Text> : null}
        </View>
        <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
        <Text style={[styles.stockBadge, styles[`stockBadge${availability.tone}`]]}>{availability.label}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.stars}>★ {Number(item.rating || 4.5).toFixed(1)}</Text>
          <Text style={styles.reviews}>({item.reviews || 0})</Text>
        </View>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>{fmt(item.price)}</Text>
            {item.old_price ? <Text style={styles.oldPrice}>{fmt(item.old_price)}</Text> : null}
          </View>
          <Pressable
            onPress={event => { event.stopPropagation(); onAdd(item); }}
            disabled={!available}
            style={[styles.addButton, !available && styles.addButtonDisabled]}
          >
            <Text style={styles.addButtonText}>{available ? '+' : '×'}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

function CategoryPill({ item, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.categoryPill, active && styles.categoryPillActive]}>
      <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

function EmptyStateIcon({ type = 'box', compact = false }) {
  if (type === 'bell') {
    return (
      <View style={[styles.emptyStateIcon, compact && styles.emptyStateIconCompact]}>
        <View style={styles.emptyBellDome} />
        <View style={styles.emptyBellBase} />
        <View style={styles.emptyBellDot} />
      </View>
    );
  }

  if (type === 'heart') {
    return (
      <View style={[styles.emptyStateIcon, compact && styles.emptyStateIconCompact]}>
        <Text style={[styles.emptyStateHeart, compact && styles.emptyStateHeartCompact]}>♡</Text>
      </View>
    );
  }

  if (type === 'account') {
    return (
      <View style={[styles.emptyStateIcon, compact && styles.emptyStateIconCompact]}>
        <View style={styles.emptyUserHead} />
        <View style={styles.emptyUserBody} />
      </View>
    );
  }

  if (type === 'cart') {
    return (
      <View style={[styles.emptyStateIcon, compact && styles.emptyStateIconCompact]}>
        <View style={styles.emptyBagHandle} />
        <View style={styles.emptyBagBody} />
      </View>
    );
  }

  return (
    <View style={[styles.emptyStateIcon, compact && styles.emptyStateIconCompact]}>
      <View style={styles.emptyBoxTop} />
      <View style={styles.emptyBoxBody} />
    </View>
  );
}

function TabIcon({ name, active }) {
  const color = active ? green : mutedLight;

  if (name === 'home') {
    return (
      <View style={styles.tabGlyph}>
        <View style={[styles.homeRoof, { borderColor: color }]} />
        <View style={[styles.homeBase, { borderColor: color }]} />
      </View>
    );
  }

  if (name === 'favorites') {
    return <Text style={[styles.tabIconText, { color }]}>{active ? '♥' : '♡'}</Text>;
  }

  if (name === 'cart') {
    return (
      <View style={styles.tabGlyph}>
        <View style={[styles.bagHandle, { borderColor: color }]} />
        <View style={[styles.bagBody, { borderColor: color }]} />
      </View>
    );
  }

  return (
    <View style={styles.tabGlyph}>
      <View style={[styles.userHead, { borderColor: color }]} />
      <View style={[styles.userBody, { borderColor: color }]} />
    </View>
  );
}

function TabButton({ label, icon, active, badge, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <View style={styles.tabIconWrap}>
        <TabIcon name={icon} active={active} />
        {badge ? (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text>
    </Pressable>
  );
}

function StatusBadge({ config, label }) {
  return (
    <View style={[styles.statusBadge, { backgroundColor: config?.bg || '#F5F5F5' }]}>
      <Text style={[styles.statusBadgeText, { color: config?.color || '#666' }]}>{config?.label || label}</Text>
    </View>
  );
}

function getCustomerOrderSteps(order) {
  const paymentStatus = order?.payment_status || 'pending';
  const orderStatus = order?.status || 'pending';
  const statusIndex = Math.max(0, orderStatusFlow.indexOf(orderStatus));
  const paymentDone = paymentStatus === 'paid';
  const paymentFailed = paymentStatus === 'failed';
  const cancelled = orderStatus === 'cancelled';

  const steps = [
    {
      id: 'payment',
      title: paymentFailed ? 'Paiement à reprendre' : paymentDone ? 'Paiement reçu' : 'Paiement en attente',
      text: paymentFailed
        ? 'Le paiement n’a pas été finalisé. Tu peux relancer Kkiapay depuis cette commande.'
        : paymentDone
          ? 'Le paiement Kkiapay est enregistré pour cette commande.'
          : 'La commande sera préparée dès que le paiement Kkiapay sera confirmé.',
      done: paymentDone,
      active: !paymentDone && !paymentFailed && !cancelled,
      blocked: paymentFailed,
    },
    {
      id: 'verification',
      title: 'Vérification BéninXi',
      text: 'Notre équipe contrôle les informations, les articles et la disponibilité.',
      done: paymentDone && statusIndex >= 1,
      active: paymentDone && statusIndex === 0 && !cancelled,
    },
    {
      id: 'preparation',
      title: 'Achat et préparation',
      text: 'BéninXi sécurise les articles et prépare la commande pour la livraison.',
      done: paymentDone && statusIndex >= 2,
      active: paymentDone && statusIndex === 1 && !cancelled,
    },
    {
      id: 'delivery',
      title: 'Livraison en cours',
      text: 'La commande est en route vers l’adresse indiquée.',
      done: paymentDone && statusIndex >= 3,
      active: paymentDone && statusIndex === 2 && !cancelled,
    },
    {
      id: 'delivered',
      title: 'Commande livrée',
      text: 'Merci d’avoir choisi BéninXi.',
      done: paymentDone && orderStatus === 'delivered',
      active: false,
    },
  ];

  if (!cancelled) return steps;

  return steps.map(step => ({
    ...step,
    active: false,
    blocked: step.id === 'verification',
    text: step.id === 'verification' ? 'Cette commande a été annulée.' : step.text,
  }));
}

function getOrderCustomerMessage(order) {
  if (order?.status === 'cancelled') {
    return 'Cette commande est annulée. Contacte BéninXi sur WhatsApp si tu veux la reprendre ou demander une alternative.';
  }
  if (order?.payment_status === 'failed') {
    return 'Le paiement n’est pas finalisé. Relance Kkiapay pour lancer la préparation.';
  }
  if (order?.payment_status !== 'paid') {
    return 'Ta commande est enregistrée. Elle passera en préparation après confirmation du paiement Kkiapay.';
  }
  if (order?.status === 'delivered') {
    return 'Commande livrée. Merci pour ta confiance.';
  }
  if (order?.status === 'shipping') {
    return 'Ta commande est en livraison. Garde ton téléphone disponible pour le livreur ou l’équipe BéninXi.';
  }
  if (order?.status === 'confirmed') {
    return 'Paiement reçu. BéninXi sécurise les articles et prépare la livraison.';
  }
  return 'Paiement reçu. BéninXi vérifie la commande avant préparation.';
}

function getActivityClientCopy(event) {
  const orderNumber = event?.order_number ? `Commande ${event.order_number}` : 'Commande';
  const fallbackDescription = event?.description || 'Mise à jour disponible sur ta commande.';

  const copyByType = {
    order_created: {
      title: 'Commande enregistrée',
      description: `${orderNumber} reçue. Elle sera préparée après confirmation du paiement.`,
      action: 'Voir la commande',
    },
    payment_confirmed: {
      title: 'Paiement reçu',
      description: `${orderNumber} est payée. BéninXi vérifie les articles et lance la préparation.`,
      action: 'Suivre la commande',
    },
    payment_failed: {
      title: 'Paiement à reprendre',
      description: `${orderNumber} n’a pas été finalisée. Tu peux relancer Kkiapay depuis le détail.`,
      action: 'Relancer / voir',
    },
    order_confirmed: {
      title: 'Commande confirmée',
      description: `${orderNumber} est validée. L’équipe BéninXi prépare la suite.`,
      action: 'Voir le suivi',
    },
    order_shipping: {
      title: 'Livraison lancée',
      description: `${orderNumber} est en route. Garde ton téléphone disponible.`,
      action: 'Voir le suivi',
    },
    order_delivered: {
      title: 'Commande livrée',
      description: `${orderNumber} est marquée comme livrée. Merci pour ta confiance.`,
      action: 'Voir le détail',
    },
    order_cancelled: {
      title: 'Commande annulée',
      description: `${orderNumber} a été annulée. Contacte BéninXi si tu veux une alternative.`,
      action: 'Voir le détail',
    },
    order_refunded: {
      title: 'Remboursement indiqué',
      description: `${orderNumber} contient une mise à jour de remboursement.`,
      action: 'Voir le détail',
    },
  };

  return copyByType[event?.event_type] || {
    title: event?.title || 'Mise à jour commande',
    description: fallbackDescription,
    action: 'Voir la commande',
  };
}

function MainApp() {
  const { openKkiapayWidget, addSuccessListener, addFailedListener } = useKkiapay();
  const [screen, setScreen] = useState('home');
  const [products, setProducts] = useState(demoProducts);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [sort, setSort] = useState('popular');
  const [priceMax, setPriceMax] = useState(500000);
  const [minRating, setMinRating] = useState(0);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [accountTab, setAccountTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [seenEventIds, setSeenEventIds] = useState([]);
  const [seenEventsHydrated, setSeenEventsHydrated] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [addresses, setAddresses] = useState([createDefaultAddress()]);
  const [addressesHydrated, setAddressesHydrated] = useState(false);
  const [addressDraft, setAddressDraft] = useState(createDefaultAddress());
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [authForm, setAuthForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    password: '',
  });
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    zone: 'sud',
    ville: 'cotonou',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showCheckoutReview, setShowCheckoutReview] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [draftOrder, setDraftOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState('');
  const draftOrderRef = useRef(null);
  const loadOrdersRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then(value => {
        if (value) setCart(JSON.parse(value));
      })
      .catch(() => AsyncStorage.removeItem(CART_STORAGE_KEY));

    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then(value => {
        if (value) setFavorites(JSON.parse(value));
      })
      .catch(() => AsyncStorage.removeItem(FAVORITES_STORAGE_KEY));

    AsyncStorage.getItem(SEARCH_HISTORY_STORAGE_KEY)
      .then(value => {
        if (!value) return;
        const savedSearches = JSON.parse(value);
        if (Array.isArray(savedSearches)) setSearchHistory(savedSearches.filter(Boolean).slice(0, 6));
      })
      .catch(() => AsyncStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY));

    AsyncStorage.getItem(ADDRESSES_STORAGE_KEY)
      .then(value => {
        if (!value) return;
        const savedAddresses = JSON.parse(value);
        if (Array.isArray(savedAddresses) && savedAddresses.length) {
          setAddresses(savedAddresses);
          const defaultAddress = savedAddresses.find(address => address.default) || savedAddresses[0];
          applyAddressToForm(defaultAddress);
        }
      })
      .catch(() => AsyncStorage.removeItem(ADDRESSES_STORAGE_KEY))
      .finally(() => setAddressesHydrated(true));

    AsyncStorage.getItem(SEEN_EVENTS_STORAGE_KEY)
      .then(value => {
        if (value) {
          const savedSeenEvents = JSON.parse(value);
          if (Array.isArray(savedSeenEvents)) setSeenEventIds(savedSeenEvents);
        }
      })
      .catch(() => AsyncStorage.removeItem(SEEN_EVENTS_STORAGE_KEY))
      .finally(() => setSeenEventsHydrated(true));
  }, []);

  useEffect(() => {
    draftOrderRef.current = draftOrder;
  }, [draftOrder]);

  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  useEffect(() => {
    AsyncStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(searchHistory.slice(0, 6))).catch(() => {});
  }, [searchHistory]);

  useEffect(() => {
    if (!addressesHydrated) return;
    AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses)).catch(() => {});
  }, [addresses, addressesHydrated]);

  useEffect(() => {
    if (!seenEventsHydrated) return;
    AsyncStorage.setItem(SEEN_EVENTS_STORAGE_KEY, JSON.stringify(seenEventIds)).catch(() => {});
  }, [seenEventIds, seenEventsHydrated]);

  useEffect(() => {
    async function loadRemoteAddresses() {
      if (!user || !isSupabaseConfigured || !supabase) return;

      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error || !data?.length) return;

      const remoteAddresses = data.map(mapRemoteAddress);
      setAddresses(remoteAddresses);
      applyAddressToForm(remoteAddresses.find(address => address.default) || remoteAddresses[0]);
    }

    loadRemoteAddresses();
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const meta = user.user_metadata || {};
    setForm(previous => ({
      ...previous,
      prenom: previous.prenom || meta.prenom || '',
      nom: previous.nom || meta.nom || '',
      telephone: previous.telephone || meta.telephone || '',
      email: previous.email || user.email || '',
    }));
  }, [user]);

  async function loadOrders({ silent = false } = {}) {
    if (!user || !isSupabaseConfigured || !supabase) {
      setOrders([]);
      setSelectedOrder(null);
      return;
    }

    if (!silent) setLoadingOrders(true);
    const telephone = user.user_metadata?.telephone || '';
    let query = supabase
      .from('orders')
      .select('*, order_events(*)')
      .order('created_at', { ascending: false });

    query = user.id ? query.eq('user_id', user.id) : query.eq('customer_phone', telephone);
    let { data, error } = await query;

    if (error && telephone) {
      const fallback = await supabase
        .from('orders')
        .select('*, order_events(*)')
        .eq('customer_phone', telephone)
        .order('created_at', { ascending: false });
      data = fallback.data;
    }

    const nextOrders = (data || []).map(order => ({
      ...order,
      order_events: sortOrderEvents(order.order_events || []),
    }));
    setOrders(nextOrders);
    setSelectedOrder(previous => {
      if (!previous) return previous;
      return nextOrders.find(order => order.id === previous.id) || previous;
    });
    if (!silent) setLoadingOrders(false);
  }

  loadOrdersRef.current = loadOrders;

  useEffect(() => {
    loadOrders();
  }, [user]);

  useEffect(() => {
    const handleSuccess = async (payload) => {
      const order = draftOrderRef.current;
      const transactionId = getKkiapayTransactionId(payload);

      if (!order) return;
      setSubmitting(true);
      setPaymentInfo('Paiement reçu. Nous synchronisons ta commande...');

      try {
        if (API_BASE_URL) {
          await fetch(`${API_BASE_URL}/api/payments/kkiapay/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_number: order.order_number,
              transaction_id: transactionId,
              event: 'success',
            }),
          });
        }

        setConfirmedOrder({
          ...order,
          payment_reference: transactionId,
          payment_status: 'pending',
        });
        setDraftOrder(null);
        setCart([]);
        setAccountTab('orders');
        await loadOrdersRef.current?.({ silent: true });
        setPaymentInfo('Paiement enregistré. La confirmation finale sera mise à jour automatiquement.');
        Alert.alert(
          'Paiement reçu',
          `Commande ${order.order_number}\nBéninXi finalise la vérification et la mise à jour du paiement.`,
          [{ text: 'OK', onPress: () => setScreen('account') }]
        );
        setTimeout(() => loadOrdersRef.current?.({ silent: true }), 4000);
      } catch (error) {
        Alert.alert('Synchronisation impossible', error.message || 'Le paiement est reçu, mais la commande doit être resynchronisée.');
      } finally {
        setSubmitting(false);
      }
    };

    const handleFailed = async (payload) => {
      const order = draftOrderRef.current;
      const transactionId = getKkiapayTransactionId(payload);
      if (!order) return;

      setPaymentInfo(`Paiement interrompu pour la commande ${order.order_number}.`);
      if (API_BASE_URL && transactionId) {
        try {
          await fetch(`${API_BASE_URL}/api/payments/kkiapay/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_number: order.order_number,
              transaction_id: transactionId,
              event: 'failed',
            }),
          });
        } catch {
          // La commande reste consultable et pourra être réessayée.
        }
      }

      await loadOrdersRef.current?.({ silent: true });
      Alert.alert('Paiement non finalisé', 'Tu peux relancer Kkiapay quand tu es prêt.');
    };

    addSuccessListener(handleSuccess);
    addFailedListener(handleFailed);
  }, [addFailedListener, addSuccessListener]);

  useEffect(() => {
    async function loadProducts() {
      if (!isSupabaseConfigured || !supabase) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(60);

      if (!error && data?.length) {
        setProducts(mergeProducts(data, demoProducts));
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const searchTerms = getSearchTerms(query);
    const result = products.map(product => {
      const matchesCategory = category === 'all' || product.category === category;
      const searchScore = getSearchScore(product, searchTerms);
      const rating = Number(product.rating || 0);
      const price = Number(product.price || 0);
      const matchesSearch = !searchTerms.length || searchScore > 0;

      return {
        ...product,
        _searchScore: searchScore,
        _matches: matchesCategory
          && matchesSearch
          && price <= priceMax
          && rating >= minRating,
      };
    }).filter(product => product._matches);

    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'rating':
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      default:
        result.sort((a, b) => (
          Number(b._searchScore || 0) - Number(a._searchScore || 0)
          || Number(b.sold || b.reviews || 0) - Number(a.sold || a.reviews || 0)
        ));
    }

    return result;
  }, [category, minRating, priceMax, products, query, sort]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const favoriteCount = favorites.length;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = getDeliveryFee(cart, form.ville);
  const total = subtotal + deliveryFee;
  const selectedCity = getCityById(form.ville);
  const southCities = deliveryZones[0]?.villes || [];
  const activities = useMemo(() => getOrderActivities(orders), [orders]);
  const unreadActivities = activities.filter(event => !seenEventIds.includes(event.id));
  const unreadActivityCount = unreadActivities.length;

  function addToCart(product) {
    if (!isProductAvailable(product)) {
      Alert.alert('Produit indisponible', 'Ce produit n’est pas disponible pour le moment. Tu peux contacter BéninXi sur WhatsApp pour une alternative.');
      return;
    }

    setCart(previous => {
      setShowCheckoutReview(false);
      const nextItem = { ...product, color: 'Standard', size: 'Standard', qty: 1 };
      const key = getLineKey(nextItem);
      const exists = previous.find(item => getLineKey(item) === key);
      if (exists) {
        return previous.map(item => getLineKey(item) === key ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...previous, nextItem];
    });
  }

  function rememberSearch(value = query) {
    const nextSearch = String(value || '').trim();
    if (!nextSearch) return;
    setSearchHistory(previous => [
      nextSearch,
      ...previous.filter(item => normalizeSearchText(item) !== normalizeSearchText(nextSearch)),
    ].slice(0, 6));
  }

  async function openWhatsAppSupport(message) {
    const encodedMessage = encodeURIComponent(message);
    const appUrl = `whatsapp://send?phone=${WHATSAPP_SUPPORT_PHONE}&text=${encodedMessage}`;
    const webUrl = `https://wa.me/${WHATSAPP_SUPPORT_PHONE}?text=${encodedMessage}`;

    try {
      const canOpenApp = await Linking.canOpenURL(appUrl);
      await Linking.openURL(canOpenApp ? appUrl : webUrl);
    } catch {
      Alert.alert('WhatsApp indisponible', `Contacte-nous directement au +${WHATSAPP_SUPPORT_PHONE}.`);
    }
  }

  function contactProductSupport(product) {
    openWhatsAppSupport(
      `Bonjour BéninXi, je veux des informations sur ce produit:\n${product.name}\nPrix: ${fmt(product.price)}`
    );
  }

  function contactCartSupport() {
    const itemsSummary = cart
      .map(item => `- ${item.name} x${item.qty}`)
      .join('\n');
    openWhatsAppSupport(
      `Bonjour BéninXi, j'ai besoin d'aide pour ma commande.\n\nPanier:\n${itemsSummary || 'Panier vide'}\n\nTotal estimé: ${fmt(total)}`
    );
  }

  function toggleFavorite(product) {
    setFavorites(previous => {
      const exists = previous.some(item => item.id === product.id);
      return exists ? previous.filter(item => item.id !== product.id) : [product, ...previous];
    });
  }

  function isFavorite(productId) {
    return favorites.some(item => item.id === productId);
  }

  function openProduct(product) {
    setSelectedProduct(product);
    setScreen('product');
  }

  function markActivitiesRead(events = activities) {
    if (!events.length) return;
    setSeenEventIds(previous => {
      const ids = new Set(previous);
      events.forEach(event => ids.add(event.id));
      return Array.from(ids).slice(-250);
    });
  }

  function openActivity(event) {
    const order = orders.find(item => item.id === event.order_id);
    if (order) {
      setSelectedOrder(order);
      markActivitiesRead([event]);
    }
  }

  function applyAddressToForm(address) {
    if (!address) return;
    setConfirmedOrder(null);
    setShowCheckoutReview(false);
    setForm(previous => ({
      ...previous,
      adresse: address.adresse || previous.adresse,
      zone: 'sud',
      ville: address.ville || previous.ville,
    }));
  }

  function startAddressCreate() {
    setEditingAddressId(null);
    setAddressDraft({
      ...createDefaultAddress(),
      id: String(Date.now()),
      default: addresses.length === 0,
    });
    setAccountTab('addresses');
  }

  function startAddressEdit(address) {
    setEditingAddressId(address.id);
    setAddressDraft(address);
    setAccountTab('addresses');
  }

  async function persistAddress(address) {
    if (!user || !isSupabaseConfigured || !supabase) return address;

    if (address.default) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const payload = {
      user_id: user.id,
      label: address.label,
      address: address.adresse,
      ville: address.ville,
      phone: form.telephone || null,
      is_default: Boolean(address.default),
    };

    const query = isUuid(address.id)
      ? supabase
          .from('customer_addresses')
          .update(payload)
          .eq('id', address.id)
          .eq('user_id', user.id)
      : supabase
          .from('customer_addresses')
          .insert(payload);

    const { data, error } = await query.select('*').single();
    if (error) throw error;
    return mapRemoteAddress(data);
  }

  async function saveAddress() {
    if (!addressDraft.label || !addressDraft.adresse || !addressDraft.ville) {
      Alert.alert('Adresse incomplète', 'Ajoute un libellé, une adresse et une ville.');
      return;
    }

    let nextAddress = {
      ...addressDraft,
      zone: 'sud',
      id: editingAddressId || addressDraft.id || String(Date.now()),
      default: addressDraft.default || addresses.length === 0,
    };

    try {
      nextAddress = await persistAddress(nextAddress);
    } catch (error) {
      Alert.alert('Adresse locale enregistrée', error.message || 'Synchronisation Supabase impossible pour le moment.');
    }

    setAddresses(previous => {
      const previousId = editingAddressId || addressDraft.id;
      const withoutCurrent = previous.filter(address => address.id !== nextAddress.id && address.id !== previousId);
      const next = [nextAddress, ...withoutCurrent];
      return next.map((address, index) => ({
        ...address,
        default: nextAddress.default ? address.id === nextAddress.id : index === 0 && !next.some(item => item.default),
      }));
    });
    applyAddressToForm(nextAddress);
    setEditingAddressId(null);
    setAddressDraft(createDefaultAddress());
    Alert.alert('Adresse enregistrée', 'Elle est disponible dans le checkout.');
  }

  function setDefaultAddress(address) {
    setAddresses(previous => previous.map(item => ({ ...item, default: item.id === address.id })));
    if (user && isSupabaseConfigured && supabase && isUuid(address.id)) {
      supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .then(() => supabase
          .from('customer_addresses')
          .update({ is_default: true })
          .eq('id', address.id)
          .eq('user_id', user.id));
    }
    applyAddressToForm(address);
  }

  function removeAddress(addressId) {
    if (user && isSupabaseConfigured && supabase && isUuid(addressId)) {
      supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);
    }
    setAddresses(previous => {
      const remaining = previous.filter(address => address.id !== addressId);
      if (!remaining.length) return [createDefaultAddress()];
      if (remaining.some(address => address.default)) return remaining;
      return remaining.map((address, index) => ({ ...address, default: index === 0 }));
    });
    if (editingAddressId === addressId) {
      setEditingAddressId(null);
      setAddressDraft(createDefaultAddress());
    }
  }

  async function saveProfile() {
    if (!isSupabaseConfigured || !supabase || !user) return;
    if (!form.prenom || !form.nom || !form.telephone) {
      Alert.alert('Profil incomplet', 'Ajoute ton prénom, nom et téléphone.');
      return;
    }

    setSavingProfile(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          prenom: form.prenom,
          nom: form.nom,
          telephone: form.telephone,
          full_name: `${form.prenom} ${form.nom}`,
        },
      });
      if (error) throw error;
      setUser(data.user || user);
      Alert.alert('Profil enregistré', 'Tes informations seront utilisées au checkout.');
    } catch (error) {
      Alert.alert('Sauvegarde impossible', error.message || 'Réessaie dans quelques instants.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitAuth() {
    if (!isSupabaseConfigured || !supabase) {
      Alert.alert('Supabase non configuré', 'Ajoute les variables EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans mobile/.env.');
      return;
    }
    if (!authForm.email || !authForm.password) {
      Alert.alert('Infos manquantes', 'Ajoute ton email et ton mot de passe.');
      return;
    }
    if (authMode === 'signup' && (!authForm.prenom || !authForm.nom || !authForm.telephone)) {
      Alert.alert('Profil incomplet', 'Ajoute ton prénom, nom et téléphone pour créer le compte.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: {
            data: {
              prenom: authForm.prenom,
              nom: authForm.nom,
              telephone: authForm.telephone,
              full_name: `${authForm.prenom} ${authForm.nom}`,
            },
          },
        });
        if (error) throw error;
        Alert.alert('Compte créé', 'Vérifie ton email si Supabase demande une confirmation.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw error;
      }
    } catch (error) {
      Alert.alert('Connexion impossible', error.message || 'Réessaie dans quelques instants.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }

  function updateQty(item, qty) {
    const key = getLineKey(item);
    setShowCheckoutReview(false);
    setCart(previous => (
      qty < 1
        ? previous.filter(cartItem => getLineKey(cartItem) !== key)
        : previous.map(cartItem => getLineKey(cartItem) === key ? { ...cartItem, qty } : cartItem)
    ));
  }

  function updateForm(field, value) {
    setConfirmedOrder(null);
    setShowCheckoutReview(false);
    setForm(previous => ({ ...previous, [field]: value }));
  }

  function validateCheckout() {
    if (!cart.length) return false;
    const unavailableItem = cart.find(item => !isProductAvailable(item));
    if (unavailableItem) {
      Alert.alert('Panier à vérifier', `${unavailableItem.name} n’est plus disponible. Retire-le du panier ou contacte BéninXi sur WhatsApp.`);
      return false;
    }
    if (!form.prenom || !form.nom || !form.telephone || !form.adresse || !form.ville) {
      Alert.alert('Infos manquantes', 'Ajoute ton prénom, nom, téléphone, adresse et ville de livraison.');
      return false;
    }
    return true;
  }

  function reviewCheckout() {
    if (!validateCheckout()) return;
    setShowCheckoutReview(true);
  }

  function openKkiapayForOrder(order) {
    if (!KKIAPAY_PUBLIC_KEY) {
      Alert.alert('Kkiapay non configuré', 'Ajoute EXPO_PUBLIC_KKIAPAY_PUBLIC_KEY dans mobile/.env pour activer le paiement.');
      return;
    }
    if (!order?.order_number || !order?.total) {
      Alert.alert('Commande invalide', 'Impossible de relancer ce paiement pour le moment.');
      return;
    }

    const customerName = order.customer_name || `${form.prenom} ${form.nom}`.trim();
    const customerPhone = order.customer_phone || form.telephone;
    const customerEmail = order.customer_email || form.email;

    setDraftOrder(order);
    setPaymentInfo(`Commande ${order.order_number} prête. Finalise le paiement Kkiapay.`);
    openKkiapayWidget({
      amount: order.total,
      api_key: KKIAPAY_PUBLIC_KEY,
      key: KKIAPAY_PUBLIC_KEY,
      sandbox: KKIAPAY_SANDBOX,
      email: customerEmail || undefined,
      phone: normalizePhone(customerPhone),
      name: customerName || undefined,
      reason: `Commande ${order.order_number}`,
      partnerId: order.order_number,
      data: JSON.stringify({ order_number: order.order_number }),
      countries: ['BJ'],
      paymentmethod: ['momo', 'card'],
      position: 'center',
      theme: green,
    });
  }

  function canRetryKkiapay(order) {
    return order?.payment_method === 'kkiapay'
      && ['pending', 'failed'].includes(order?.payment_status)
      && !['cancelled', 'delivered'].includes(order?.status);
  }

  async function placeOrder() {
    if (!validateCheckout()) return;
    if (!API_BASE_URL) {
      Alert.alert('API non configurée', 'Ajoute EXPO_PUBLIC_API_BASE_URL dans mobile/.env pour envoyer les commandes.');
      return;
    }
    if (!KKIAPAY_PUBLIC_KEY) {
      Alert.alert('Kkiapay non configuré', 'Ajoute EXPO_PUBLIC_KKIAPAY_PUBLIC_KEY dans mobile/.env pour activer le paiement.');
      return;
    }

    setSubmitting(true);
    setPaymentInfo('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          headers.Authorization = `Bearer ${data.session.access_token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          form,
          items: cart,
          payment_method: 'kkiapay',
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de confirmer la commande.');
      }

      setDraftOrder(payload);
      openKkiapayForOrder(payload);
    } catch (error) {
      Alert.alert('Commande impossible', error.message || 'Réessaie dans quelques instants.');
    } finally {
      setSubmitting(false);
    }
  }

  function renderHome() {
    return (
      <FlatList
        data={filteredProducts}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={(
          <>
            <View style={styles.hero}>
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>BéninXi</Text>
                <Text style={styles.heroTitle}>Vos achats au Bénin, avec plus de confiance.</Text>
                <Text style={styles.heroText}>Produits sélectionnés, paiement Kkiapay sécurisé et livraison organisée par BéninXi.</Text>
              </View>
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricValue}>{cartCount}</Text>
                <Text style={styles.heroMetricLabel}>panier</Text>
              </View>
            </View>

            <View style={styles.howItWorks}>
              <View style={styles.howItWorksHeader}>
                <Text style={styles.howItWorksTitle}>Comment utiliser BéninXi</Text>
              </View>
              <Text style={styles.howItWorksSubtitle}>Un parcours clair en 4 étapes</Text>
              <View style={styles.stepGrid}>
                {appSteps.map(step => (
                  <View key={step.id} style={styles.stepCard}>
                    <Text style={styles.stepNumber}>{step.number}</Text>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.searchBox}>
              <View style={styles.searchGlyph}>
                <View style={styles.searchGlyphCircle} />
                <View style={styles.searchGlyphHandle} />
              </View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => rememberSearch()}
                placeholder="Rechercher smartphone, pagne..."
                placeholderTextColor="#999"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} style={styles.searchClearButton}>
                  <Text style={styles.searchClearText}>×</Text>
                </Pressable>
              ) : null}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              {categories.map(item => (
                <CategoryPill
                  key={item.id}
                  item={item}
                  active={category === item.id}
                  onPress={() => setCategory(item.id)}
                />
              ))}
            </ScrollView>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
              {sortOptions.map(option => (
                <Pressable
                  key={option.id}
                  onPress={() => setSort(option.id)}
                  style={[styles.filterChip, sort === option.id && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, sort === option.id && styles.filterChipTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.quickFilters}>
              <Pressable
                onPress={() => setPriceMax(priceMax === 50000 ? 500000 : 50000)}
                style={[styles.quickFilterButton, priceMax === 50000 && styles.quickFilterButtonActive]}
              >
                <Text style={[styles.quickFilterText, priceMax === 50000 && styles.quickFilterTextActive]}>Moins de 50k</Text>
              </Pressable>
              <Pressable
                onPress={() => setMinRating(minRating === 4 ? 0 : 4)}
                style={[styles.quickFilterButton, minRating === 4 && styles.quickFilterButtonActive]}
              >
                <Text style={[styles.quickFilterText, minRating === 4 && styles.quickFilterTextActive]}>4★ et plus</Text>
              </Pressable>
              {(priceMax !== 500000 || minRating > 0 || sort !== 'popular') ? (
                <Pressable
                  onPress={() => { setPriceMax(500000); setMinRating(0); setSort('popular'); }}
                  style={styles.resetFiltersButton}
                >
                  <Text style={styles.resetFiltersText}>Réinitialiser</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{category === 'all' ? 'Produits populaires' : categories.find(item => item.id === category)?.label}</Text>
              <Text style={styles.sectionCount}>{filteredProducts.length}</Text>
            </View>

            {loading ? <ActivityIndicator color={green} style={styles.loader} /> : null}
          </>
        )}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onAdd={addToCart}
            onOpen={openProduct}
            onToggleFavorite={toggleFavorite}
            favorite={isFavorite(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun produit trouvé.</Text>}
      />
    );
  }

  function renderProduct() {
    const product = selectedProduct;
    if (!product) {
      return (
        <View style={[styles.content, styles.emptyCart]}>
          <Text style={styles.emptyCartTitle}>Produit introuvable</Text>
          <Pressable onPress={() => setScreen('home')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Retour au catalogue</Text>
          </Pressable>
        </View>
      );
    }

    const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;
    const related = getRelatedProducts(product, products);
    const availability = getAvailability(product);
    const available = availability.tone !== 'danger';

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => setScreen('home')} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Catalogue</Text>
        </Pressable>

        <View style={styles.productHero}>
          <Image source={{ uri: product.img }} alt={product.name} style={styles.productHeroImage} />
          <Pressable onPress={() => toggleFavorite(product)} style={[styles.productFavorite, isFavorite(product.id) && styles.favoriteButtonActive]}>
            <Text style={styles.favoriteButtonText}>{isFavorite(product.id) ? '♥' : '♡'}</Text>
          </Pressable>
          {discount > 0 ? <Text style={styles.productDiscount}>-{discount}%</Text> : null}
        </View>

        <View style={styles.productPanel}>
          <Text style={styles.productSeller}>Sélection BéninXi</Text>
          <Text style={styles.productTitle}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.stars}>★ {Number(product.rating || 4.5).toFixed(1)}</Text>
            <Text style={styles.reviews}>({product.reviews || 0} avis)</Text>
            <Text style={styles.reviews}>· {product.sold || 0} ventes</Text>
          </View>

          <View style={styles.productPriceRow}>
            <Text style={styles.productPrice}>{fmt(product.price)}</Text>
            {product.old_price ? <Text style={styles.productOldPrice}>{fmt(product.old_price)}</Text> : null}
          </View>

          <View style={[styles.availabilityCard, styles[`availabilityCard${availability.tone}`]]}>
            <Text style={[styles.availabilityTitle, styles[`availabilityText${availability.tone}`]]}>{availability.label}</Text>
            <Text style={styles.availabilityDetail}>{availability.detail}</Text>
          </View>

          <View style={styles.productTrustRow}>
            <Text style={styles.trustPill}>Sélection vérifiée</Text>
            <Text style={styles.trustPill}>Support prioritaire</Text>
            <Text style={styles.trustPill}>Livraison coordonnée</Text>
            <Text style={styles.trustPill}>Paiement sécurisé</Text>
          </View>

          <View style={styles.trustCard}>
            <View style={styles.trustCardIcon}>
              <Text style={styles.trustCardIconText}>✓</Text>
            </View>
            <View style={styles.trustCardCopy}>
              <Text style={styles.trustCardTitle}>Sélection contrôlée par BéninXi</Text>
              <Text style={styles.trustCardText}>Notre équipe confirme les informations essentielles et reste disponible sur WhatsApp.</Text>
            </View>
          </View>

          <Text style={styles.productSectionTitle}>Description</Text>
          <Text style={styles.productDescription}>
            {getProductDescription(product)}
          </Text>

          <Pressable onPress={() => contactProductSupport(product)} style={styles.whatsappButton}>
            <Text style={styles.whatsappButtonText}>WhatsApp · Poser une question</Text>
          </Pressable>

          <Pressable
            onPress={() => addToCart(product)}
            disabled={!available}
            style={[styles.primaryButton, !available && styles.primaryButtonDisabled]}
          >
            <Text style={styles.primaryButtonText}>{available ? 'Ajouter au panier' : 'Indisponible'}</Text>
          </Pressable>
        </View>

        {related.length ? (
          <>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Produits similaires</Text>
              <Text style={styles.relatedSubtitle}>Même univers, prix proches et bonnes notes.</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedList}>
              {related.map(item => (
                <Pressable key={item.id} onPress={() => setSelectedProduct(item)} style={styles.relatedCard}>
                  <Image source={{ uri: item.img }} alt={item.name} style={styles.relatedImage} />
                  <Text numberOfLines={2} style={styles.relatedName}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>{fmt(item.price)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>
    );
  }

  function renderFavorites() {
    return (
      <FlatList
        data={favorites}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.content}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={40}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={(
          <View style={styles.favoritesHeader}>
            <Text style={styles.pageTitle}>Favoris</Text>
            <Text style={styles.favoritesText}>{favoriteCount} produit{favoriteCount > 1 ? 's' : ''} gardé{favoriteCount > 1 ? 's' : ''} pour plus tard.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onAdd={addToCart}
            onOpen={openProduct}
            onToggleFavorite={toggleFavorite}
            favorite={isFavorite(item.id)}
          />
        )}
        ListEmptyComponent={(
          <View style={styles.emptyCart}>
            <EmptyStateIcon type="heart" />
            <Text style={styles.emptyCartTitle}>Aucune sélection enregistrée</Text>
            <Pressable onPress={() => setScreen('home')} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Découvrir des produits</Text>
            </Pressable>
          </View>
        )}
      />
    );
  }

  function renderOrderTimeline(order) {
    const events = sortOrderEvents(order?.order_events || []);
    if (!events.length) {
      return (
        <View style={styles.timelineBox}>
          <Text style={styles.timelineTitle}>Historique</Text>
          <Text style={styles.timelineEmpty}>Aucun événement complémentaire pour le moment.</Text>
        </View>
      );
    }

    return (
      <View style={styles.timelineBox}>
        <Text style={styles.timelineTitle}>Historique</Text>
        {events.map(event => {
          const appearance = eventAppearance[event.event_type] || { icon: '•', color: black, bg: '#F5F5F5' };
          return (
            <View key={event.id} style={styles.timelineItem}>
              <View style={[styles.timelineIcon, { backgroundColor: appearance.bg }]}>
                <Text style={[styles.timelineIconText, { color: appearance.color }]}>{appearance.icon}</Text>
              </View>
              <View style={styles.timelineCopy}>
                <View style={styles.timelineHead}>
                  <Text style={styles.timelineEventTitle}>{event.title}</Text>
                  <Text style={styles.timelineDate}>{formatDateTime(event.created_at)}</Text>
                </View>
                {event.description ? <Text style={styles.timelineDescription}>{event.description}</Text> : null}
                <Text style={styles.timelineActor}>{event.actor_label || (event.actor_type === 'admin' ? 'Équipe BéninXi' : 'Système')}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  function renderOrderDetail() {
    const order = selectedOrder;
    if (!order) return null;

    const subtotalValue = getOrderSubtotal(order);
    const deliveryValue = getOrderDeliveryFee(order);
    const location = getLocationLabel(order.zone, order.ville);
    const customerSteps = getCustomerOrderSteps(order);
    const customerMessage = getOrderCustomerMessage(order);

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => setSelectedOrder(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Commandes</Text>
        </Pressable>

        <View style={styles.orderDetailCard}>
          <Text style={styles.orderEyebrow}>COMMANDE</Text>
          <Text style={styles.orderNumber}>{order.order_number || String(order.id).slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>

          <View style={styles.statusRow}>
            <StatusBadge config={orderStatusConfig[order.status]} label={order.status} />
            <StatusBadge config={paymentStatusConfig[order.payment_status]} label={order.payment_status} />
          </View>

          <View style={styles.orderCustomerMessage}>
            <Text style={styles.orderCustomerMessageTitle}>Suivi de ta commande</Text>
            <Text style={styles.orderCustomerMessageText}>{customerMessage}</Text>
          </View>

          {canRetryKkiapay(order) ? (
            <View style={styles.paymentNotice}>
              <Text style={styles.paymentNoticeTitle}>
                {order.payment_status === 'failed' ? 'Paiement échoué' : 'Paiement en attente'}
              </Text>
              <Text style={styles.paymentNoticeText}>
                Finalise cette commande avec Kkiapay pour lancer la préparation.
              </Text>
              <Pressable onPress={() => openKkiapayForOrder(order)} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Réessayer Kkiapay</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.customerProgressBox}>
            {customerSteps.map((step, index) => (
              <View key={step.id} style={styles.customerStep}>
                <View style={styles.customerStepRail}>
                  <View
                    style={[
                      styles.customerStepDot,
                      step.done && styles.customerStepDotDone,
                      step.active && styles.customerStepDotActive,
                      step.blocked && styles.customerStepDotBlocked,
                    ]}
                  >
                    <Text
                      style={[
                        styles.customerStepDotText,
                        (step.done || step.active || step.blocked) && styles.customerStepDotTextActive,
                      ]}
                    >
                      {step.done ? '✓' : step.blocked ? '!' : index + 1}
                    </Text>
                  </View>
                  {index < customerSteps.length - 1 ? (
                    <View style={[styles.customerStepLine, step.done && styles.customerStepLineDone]} />
                  ) : null}
                </View>
                <View style={styles.customerStepCopy}>
                  <Text style={[styles.customerStepTitle, (step.done || step.active) && styles.customerStepTitleActive]}>{step.title}</Text>
                  <Text style={styles.customerStepText}>{step.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.productSectionTitle}>Articles</Text>
          {(order.items || []).map((item, index) => (
            <View key={`${item.id || item.name}-${index}`} style={styles.orderItem}>
              <Image source={{ uri: item.img }} alt={item.name} style={styles.orderItemImage} />
              <View style={styles.orderItemInfo}>
                <Text numberOfLines={2} style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemMeta}>Qté {item.qty}</Text>
              </View>
              <Text style={styles.orderItemPrice}>{fmt(Number(item.price || 0) * Number(item.qty || 0))}</Text>
            </View>
          ))}

          <View style={styles.orderSummary}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Sous-total</Text>
              <Text style={styles.orderValue}>{fmt(subtotalValue)}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Livraison</Text>
              <Text style={styles.orderValue}>{fmt(deliveryValue)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fmt(order.total)}</Text>
            </View>
          </View>

          <View style={styles.deliveryCard}>
            <Text style={styles.orderEyebrow}>LIVRAISON</Text>
            <Text style={styles.deliveryAddress}>{order.address}</Text>
            <Text style={styles.deliveryLocation}>{location || order.zone || 'Zone non précisée'}</Text>
            <Text style={styles.deliveryLocation}>{order.customer_phone}</Text>
          </View>
        </View>

        {renderOrderTimeline(order)}
      </ScrollView>
    );
  }

  function renderOrdersList() {
    if (loadingOrders) {
      return (
        <View style={styles.ordersState}>
          <ActivityIndicator color={green} />
          <Text style={styles.ordersStateText}>Chargement des commandes...</Text>
        </View>
      );
    }

    if (!orders.length) {
      return (
        <View style={styles.emptyCart}>
          <EmptyStateIcon type="box" />
          <Text style={styles.emptyCartTitle}>Aucune commande</Text>
          <Pressable onPress={() => setScreen('home')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Explorer le catalogue</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.ordersList}>
        {activities.length ? (
          <View style={styles.activityPreview}>
            <View style={styles.activityPreviewHead}>
              <Text style={styles.activityPreviewTitle}>Ce qui a bougé</Text>
              <Pressable onPress={() => setAccountTab('activity')}>
                <Text style={styles.activityPreviewLink}>Tout voir</Text>
              </Pressable>
            </View>
            {activities.slice(0, 2).map(event => {
              const copy = getActivityClientCopy(event);
              const unread = !seenEventIds.includes(event.id);
              return (
                <Pressable key={event.id} onPress={() => openActivity(event)} style={styles.activityMiniItem}>
                  <View style={styles.activityMiniHead}>
                    <Text style={styles.activityMiniTitle}>{copy.title}</Text>
                    {unread ? <View style={styles.unreadDotSmall} /> : null}
                  </View>
                  <Text numberOfLines={2} style={styles.activityMiniDescription}>{copy.description}</Text>
                  <Text style={styles.activityMiniDate}>{event.order_number} · {formatDateTime(event.created_at)}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <View style={styles.ordersHeader}>
          <Text style={styles.ordersHeaderTitle}>Mes commandes</Text>
          <Pressable onPress={() => loadOrders()} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Rafraîchir</Text>
          </Pressable>
        </View>
        {orders.map(order => (
          <Pressable key={order.id} onPress={() => setSelectedOrder(order)} style={styles.orderListCard}>
            <View style={styles.orderListIcon}>
              <EmptyStateIcon type="box" compact />
            </View>
            <View style={styles.orderListInfo}>
              <Text style={styles.orderListNumber}>{order.order_number || String(order.id).slice(-8).toUpperCase()}</Text>
              <Text style={styles.orderListDate}>{formatDate(order.created_at)} · {(order.items || []).length} article{(order.items || []).length > 1 ? 's' : ''}</Text>
              <View style={styles.statusRowCompact}>
                <StatusBadge config={orderStatusConfig[order.status]} label={order.status} />
                {canRetryKkiapay(order) ? <StatusBadge config={paymentStatusConfig[order.payment_status]} label={order.payment_status} /> : null}
              </View>
            </View>
            <View style={styles.orderListRight}>
              <Text style={styles.orderListTotal}>{fmt(order.total)}</Text>
              <Text style={styles.orderListArrow}>›</Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderActivityCenter() {
    return (
      <View style={styles.activityCenter}>
        <View style={styles.ordersHeader}>
          <View>
            <Text style={styles.ordersHeaderTitle}>Activités</Text>
            <Text style={styles.activitySubtitle}>
              {unreadActivityCount ? `${unreadActivityCount} nouvelle${unreadActivityCount > 1 ? 's' : ''}` : 'Tout est lu'}
            </Text>
          </View>
          {unreadActivityCount ? (
            <Pressable onPress={() => markActivitiesRead()} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Tout lire</Text>
            </Pressable>
          ) : null}
        </View>

        {!activities.length ? (
          <View style={styles.emptyCart}>
            <EmptyStateIcon type="bell" />
            <Text style={styles.emptyCartTitle}>Aucune activité</Text>
          </View>
        ) : (
          activities.map(event => {
            const appearance = eventAppearance[event.event_type] || { icon: '•', color: black, bg: '#F5F5F5' };
            const unread = !seenEventIds.includes(event.id);
            const copy = getActivityClientCopy(event);
            return (
              <Pressable key={event.id} onPress={() => openActivity(event)} style={[styles.activityCard, unread && styles.activityCardUnread]}>
                <View style={[styles.activityIcon, { backgroundColor: appearance.bg }]}>
                  <Text style={[styles.activityIconText, { color: appearance.color }]}>{appearance.icon}</Text>
                </View>
                <View style={styles.activityCopy}>
                  <View style={styles.activityTitleRow}>
                    <Text style={styles.activityTitle}>{copy.title}</Text>
                    {unread ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text numberOfLines={3} style={styles.activityDescription}>{copy.description}</Text>
                  <Text style={styles.activityMeta}>{event.order_number} · {formatDateTime(event.created_at)}</Text>
                  <View style={styles.activityActionPill}>
                    <Text style={styles.activityActionText}>{copy.action}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    );
  }

  function renderAddressBook() {
    return (
      <View>
        <View style={styles.addressForm}>
          <View style={styles.addressFormHead}>
            <Text style={styles.checkoutTitle}>{editingAddressId ? 'Modifier adresse' : 'Nouvelle adresse'}</Text>
            {editingAddressId ? (
              <Pressable onPress={startAddressCreate}>
                <Text style={styles.resetFiltersText}>Nouveau</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput value={addressDraft.label} onChangeText={label => setAddressDraft(previous => ({ ...previous, label }))} placeholder="Libellé: Domicile, Bureau..." style={styles.input} />
          <TextInput value={addressDraft.adresse} onChangeText={adresse => setAddressDraft(previous => ({ ...previous, adresse }))} placeholder="Adresse complète" style={styles.input} />

          <Text style={styles.fieldLabel}>Ville de livraison</Text>
          <View style={styles.addressCityGrid}>
            {southCities.map(ville => (
              <Pressable
                key={ville.id}
                onPress={() => setAddressDraft(previous => ({ ...previous, zone: 'sud', ville: ville.id }))}
                style={[styles.addressCityButton, addressDraft.ville === ville.id && styles.addressCityButtonActive]}
              >
                <Text style={[styles.addressCityText, addressDraft.ville === ville.id && styles.addressCityTextActive]}>{ville.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setAddressDraft(previous => ({ ...previous, default: !previous.default }))}
            style={[styles.defaultToggle, addressDraft.default && styles.defaultToggleActive]}
          >
            <Text style={[styles.defaultToggleText, addressDraft.default && styles.defaultToggleTextActive]}>
              {addressDraft.default ? 'Adresse par défaut' : 'Définir par défaut'}
            </Text>
          </Pressable>

          <Pressable onPress={saveAddress} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Enregistrer l’adresse</Text>
          </Pressable>
        </View>

        <View style={styles.addressList}>
          {addresses.map(address => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressCardHead}>
                <View>
                  <Text style={styles.addressCardTitle}>{address.label}</Text>
                  {address.default ? <Text style={styles.addressDefaultText}>Par défaut</Text> : null}
                </View>
                <Pressable onPress={() => setDefaultAddress(address)} style={styles.addressUseButton}>
                  <Text style={styles.addressUseText}>Utiliser</Text>
                </Pressable>
              </View>
              <Text style={styles.addressText}>{address.adresse || 'Adresse à compléter'}</Text>
              <Text style={styles.addressLocation}>{getLocationLabel(address.zone, address.ville)}</Text>
              <View style={styles.addressActions}>
                <Pressable onPress={() => startAddressEdit(address)} style={styles.addressAction}>
                  <Text style={styles.addressActionText}>Modifier</Text>
                </Pressable>
                <Pressable onPress={() => removeAddress(address.id)} style={styles.addressAction}>
                  <Text style={[styles.addressActionText, styles.addressDeleteText]}>Supprimer</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  function renderProfilePanel(profileName) {
    return (
      <View style={styles.accountCard}>
        <EmptyStateIcon type="account" />
        <Text style={styles.accountTitle}>{profileName || 'BéninXi Client'}</Text>
        <Text style={styles.accountText}>{user.email}</Text>

        <View style={styles.profileForm}>
          <View style={styles.formRow}>
            <TextInput value={form.prenom} onChangeText={prenom => updateForm('prenom', prenom)} placeholder="Prénom" style={[styles.input, styles.halfInput]} />
            <TextInput value={form.nom} onChangeText={nom => updateForm('nom', nom)} placeholder="Nom" style={[styles.input, styles.halfInput]} />
          </View>
          <TextInput value={form.telephone} onChangeText={telephone => updateForm('telephone', telephone)} placeholder="Téléphone" keyboardType="phone-pad" style={styles.input} />
          <TextInput value={form.email} onChangeText={email => updateForm('email', email)} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={styles.input} editable={false} />
          <Pressable onPress={saveProfile} disabled={savingProfile} style={[styles.primaryButton, savingProfile && styles.primaryButtonDisabled]}>
            <Text style={styles.primaryButtonText}>{savingProfile ? 'Sauvegarde...' : 'Enregistrer le profil'}</Text>
          </Pressable>
        </View>

        <View style={styles.accountStats}>
          <View style={styles.accountStat}>
            <Text style={styles.accountStatValue}>{orders.length}</Text>
            <Text style={styles.accountStatLabel}>commandes</Text>
          </View>
          <View style={styles.accountStat}>
            <Text style={styles.accountStatValue}>{addresses.length}</Text>
            <Text style={styles.accountStatLabel}>adresses</Text>
          </View>
          <View style={styles.accountStat}>
            <Text style={styles.accountStatValue}>{favoriteCount}</Text>
            <Text style={styles.accountStatLabel}>favoris</Text>
          </View>
        </View>
        <Pressable onPress={signOut} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Se déconnecter</Text>
        </Pressable>
      </View>
    );
  }

  function renderCart() {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.pageTitle}>Panier</Text>
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <EmptyStateIcon type="cart" />
              <Text style={styles.emptyCartTitle}>Votre panier attend sa première sélection</Text>
              <Pressable onPress={() => setScreen('home')} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Explorer le catalogue</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {cart.map(item => (
                <View key={getLineKey(item)} style={styles.cartItem}>
                  <Image source={{ uri: item.img }} alt={item.name} style={styles.cartImage} />
                  <View style={styles.cartInfo}>
                    <Text numberOfLines={1} style={styles.cartName}>{item.name}</Text>
                    <Text numberOfLines={1} style={styles.cartSeller}>Sélection BéninXi</Text>
                    <Text style={[styles.cartStock, styles[`cartStock${getAvailability(item).tone}`]]}>{getAvailability(item).label}</Text>
                    <Text style={styles.cartPrice}>{fmt(item.price * item.qty)}</Text>
                    <View style={styles.qtyRow}>
                      <Pressable onPress={() => updateQty(item, item.qty - 1)} style={styles.qtyButton}>
                        <Text style={styles.qtyButtonText}>−</Text>
                      </Pressable>
                      <Text style={styles.qtyText}>{item.qty}</Text>
                      <Pressable onPress={() => updateQty(item, item.qty + 1)} style={styles.qtyButton}>
                        <Text style={styles.qtyButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.checkoutBox}>
                <Text style={styles.checkoutTitle}>Livraison</Text>
                {addresses.length ? (
                  <>
                    <Text style={styles.fieldLabel}>Adresse enregistrée</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedAddressList}>
                      {addresses.map(address => {
                        const active = form.adresse === address.adresse && form.ville === address.ville;
                        return (
                          <Pressable
                            key={address.id}
                            onPress={() => applyAddressToForm(address)}
                            style={[styles.savedAddressChip, active && styles.savedAddressChipActive]}
                          >
                            <Text style={[styles.savedAddressLabel, active && styles.savedAddressLabelActive]}>{address.label}</Text>
                            <Text numberOfLines={1} style={styles.savedAddressLocation}>{getLocationLabel(address.zone, address.ville)}</Text>
                          </Pressable>
                        );
                      })}
                      <Pressable onPress={() => { startAddressCreate(); setScreen('account'); }} style={styles.savedAddressAdd}>
                        <Text style={styles.savedAddressAddText}>+ Nouvelle</Text>
                      </Pressable>
                    </ScrollView>
                  </>
                ) : null}
                <View style={styles.formRow}>
                  <TextInput value={form.prenom} onChangeText={prenom => updateForm('prenom', prenom)} placeholder="Prénom" style={[styles.input, styles.halfInput]} />
                  <TextInput value={form.nom} onChangeText={nom => updateForm('nom', nom)} placeholder="Nom" style={[styles.input, styles.halfInput]} />
                </View>
                <TextInput value={form.telephone} onChangeText={telephone => updateForm('telephone', telephone)} placeholder="Téléphone" keyboardType="phone-pad" style={styles.input} />
                <TextInput value={form.email} onChangeText={email => updateForm('email', email)} placeholder="Email (optionnel)" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
                <TextInput value={form.adresse} onChangeText={adresse => updateForm('adresse', adresse)} placeholder="Adresse de livraison" style={styles.input} />

                <Text style={styles.fieldLabel}>Ville de livraison</Text>
                <View style={styles.cityGrid}>
                  {southCities.map(ville => {
                    const fee = getDeliveryFee(cart, ville.id);
                    return (
                      <Pressable
                        key={ville.id}
                        onPress={() => {
                          setConfirmedOrder(null);
                          setShowCheckoutReview(false);
                          setForm(previous => ({ ...previous, zone: 'sud', ville: ville.id }));
                        }}
                        style={[styles.cityButton, form.ville === ville.id && styles.cityButtonActive]}
                      >
                        <Text style={[styles.cityName, form.ville === ville.id && styles.cityNameActive]}>{ville.label}</Text>
                        <Text style={styles.cityFee}>{fmt(fee)}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>Paiement</Text>
                <View style={[styles.paymentButton, styles.paymentButtonActive]}>
                  <Text style={styles.paymentIcon}>{paymentMethod.icon}</Text>
                  <View style={styles.paymentCopy}>
                    <Text style={styles.paymentTitle}>{paymentMethod.label}</Text>
                    <Text style={styles.paymentDesc}>{paymentMethod.desc}</Text>
                  </View>
                </View>
                {paymentInfo ? <Text style={styles.paymentInfo}>{paymentInfo}</Text> : null}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Sous-total</Text>
                  <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Livraison {selectedCity ? `· ${selectedCity.label}` : ''}</Text>
                  <Text style={styles.totalValue}>{fmt(deliveryFee)}</Text>
                </View>
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Total</Text>
                  <Text style={styles.grandTotalValue}>{fmt(total)}</Text>
                </View>

                {showCheckoutReview ? (
                  <View style={styles.checkoutReview}>
                    <View style={styles.checkoutReviewHeader}>
                      <View>
                        <Text style={styles.checkoutReviewEyebrow}>Avant paiement</Text>
                        <Text style={styles.checkoutReviewTitle}>Dernière vérification</Text>
                      </View>
                      <Pressable onPress={() => setShowCheckoutReview(false)} style={styles.checkoutReviewEdit}>
                        <Text style={styles.checkoutReviewEditText}>Modifier</Text>
                      </Pressable>
                    </View>

                    <View style={styles.reviewSection}>
                      <Text style={styles.reviewSectionTitle}>Articles</Text>
                      {cart.map(item => (
                        <View key={getLineKey(item)} style={styles.reviewItem}>
                          <Text numberOfLines={1} style={styles.reviewItemName}>{item.name}</Text>
                          <Text style={styles.reviewItemMeta}>x{item.qty} · {fmt(item.price * item.qty)}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.reviewSection}>
                      <Text style={styles.reviewSectionTitle}>Livraison</Text>
                      <Text style={styles.reviewText}>{form.prenom} {form.nom} · {form.telephone}</Text>
                      <Text style={styles.reviewText}>{form.adresse}</Text>
                      <Text style={styles.reviewStrong}>{selectedCity?.label} · {fmt(deliveryFee)}</Text>
                    </View>

                    <View style={styles.reviewTotalBox}>
                      <Text style={styles.reviewTotalLabel}>Total à payer</Text>
                      <Text style={styles.reviewTotalValue}>{fmt(total)}</Text>
                    </View>

                    <Text style={styles.reviewTrustText}>
                      Après le paiement, BéninXi confirme la commande et coordonne la livraison avec soin.
                    </Text>
                  </View>
                ) : null}

                <Pressable onPress={contactCartSupport} style={styles.whatsappButton}>
                  <Text style={styles.whatsappButtonText}>WhatsApp · Assistance BéninXi</Text>
                </Pressable>
                <Pressable
                  onPress={showCheckoutReview ? placeOrder : reviewCheckout}
                  disabled={submitting}
                  style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
                >
                  <Text style={styles.primaryButtonText}>
                    {submitting
                      ? 'Ouverture Kkiapay...'
                      : showCheckoutReview
                        ? 'Confirmer et payer avec Kkiapay'
                        : 'Vérifier avant paiement'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  function renderAccount() {
    const profileName = user?.user_metadata?.full_name || [user?.user_metadata?.prenom, user?.user_metadata?.nom].filter(Boolean).join(' ');

    if (selectedOrder) {
      return renderOrderDetail();
    }

    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Compte</Text>
        {confirmedOrder ? (
          <View style={styles.orderCard}>
            <Text style={styles.orderEyebrow}>DERNIÈRE COMMANDE</Text>
            <Text style={styles.orderNumber}>{confirmedOrder.order_number}</Text>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total</Text>
              <Text style={styles.orderValue}>{fmt(confirmedOrder.total)}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Livraison</Text>
              <Text style={styles.orderValue}>{fmt(confirmedOrder.delivery_fee)}</Text>
            </View>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Paiement</Text>
              <Text style={styles.orderValue}>Kkiapay</Text>
            </View>
          </View>
        ) : null}
        {user ? (
          <>
            <View style={styles.accountTabs}>
              <Pressable onPress={() => setAccountTab('orders')} style={[styles.accountTab, accountTab === 'orders' && styles.accountTabActive]}>
                <Text style={[styles.accountTabText, accountTab === 'orders' && styles.accountTabTextActive]}>Commandes</Text>
              </Pressable>
              <Pressable onPress={() => { setAccountTab('activity'); markActivitiesRead(); }} style={[styles.accountTab, accountTab === 'activity' && styles.accountTabActive]}>
                <Text style={[styles.accountTabText, accountTab === 'activity' && styles.accountTabTextActive]}>
                  Activités{unreadActivityCount ? ` ${unreadActivityCount}` : ''}
                </Text>
              </Pressable>
              <Pressable onPress={() => setAccountTab('profile')} style={[styles.accountTab, accountTab === 'profile' && styles.accountTabActive]}>
                <Text style={[styles.accountTabText, accountTab === 'profile' && styles.accountTabTextActive]}>Profil</Text>
              </Pressable>
              <Pressable onPress={() => setAccountTab('addresses')} style={[styles.accountTab, accountTab === 'addresses' && styles.accountTabActive]}>
                <Text style={[styles.accountTabText, accountTab === 'addresses' && styles.accountTabTextActive]}>Adresses</Text>
              </Pressable>
            </View>

            {accountTab === 'orders' ? renderOrdersList() : null}
            {accountTab === 'activity' ? renderActivityCenter() : null}
            {accountTab === 'profile' ? renderProfilePanel(profileName) : null}
            {accountTab === 'addresses' ? renderAddressBook() : null}
          </>
        ) : (
          <View style={styles.accountCard}>
            <EmptyStateIcon type="account" />
            <Text style={styles.accountTitle}>{authMode === 'login' ? 'Accéder à mon compte' : 'Créer mon compte'}</Text>
            <Text style={styles.accountText}>Retrouve tes commandes, tes adresses et un checkout plus rapide.</Text>

            <View style={styles.authSwitch}>
              <Pressable onPress={() => setAuthMode('login')} style={[styles.authSwitchButton, authMode === 'login' && styles.authSwitchButtonActive]}>
                <Text style={[styles.authSwitchText, authMode === 'login' && styles.authSwitchTextActive]}>Connexion</Text>
              </Pressable>
              <Pressable onPress={() => setAuthMode('signup')} style={[styles.authSwitchButton, authMode === 'signup' && styles.authSwitchButtonActive]}>
                <Text style={[styles.authSwitchText, authMode === 'signup' && styles.authSwitchTextActive]}>Inscription</Text>
              </Pressable>
            </View>

            {authMode === 'signup' ? (
              <>
                <View style={styles.formRow}>
                  <TextInput value={authForm.prenom} onChangeText={prenom => setAuthForm(previous => ({ ...previous, prenom }))} placeholder="Prénom" style={[styles.input, styles.halfInput]} />
                  <TextInput value={authForm.nom} onChangeText={nom => setAuthForm(previous => ({ ...previous, nom }))} placeholder="Nom" style={[styles.input, styles.halfInput]} />
                </View>
                <TextInput value={authForm.telephone} onChangeText={telephone => setAuthForm(previous => ({ ...previous, telephone }))} placeholder="Téléphone" keyboardType="phone-pad" style={styles.input} />
              </>
            ) : null}
            <TextInput value={authForm.email} onChangeText={email => setAuthForm(previous => ({ ...previous, email }))} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            <TextInput value={authForm.password} onChangeText={password => setAuthForm(previous => ({ ...previous, password }))} placeholder="Mot de passe" secureTextEntry style={styles.input} />

            <Pressable onPress={submitAuth} disabled={authLoading} style={[styles.primaryButton, authLoading && styles.primaryButtonDisabled]}>
              <Text style={styles.primaryButtonText}>{authLoading ? 'Patiente...' : authMode === 'login' ? 'Se connecter' : 'Créer le compte'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" backgroundColor={surface} translucent={false} />
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image source={beninxiLogo} style={styles.headerLogoImage} resizeMode="contain" />
          <View>
            <Text style={styles.logo}><Text style={styles.logoGreen}>Bénin</Text><Text style={styles.logoRed}>Xi</Text></Text>
          </View>
        </View>
      </View>

      <View style={styles.flex}>
        {screen === 'home' ? renderHome() : null}
        {screen === 'product' ? renderProduct() : null}
        {screen === 'favorites' ? renderFavorites() : null}
        {screen === 'cart' ? renderCart() : null}
        {screen === 'account' ? renderAccount() : null}
      </View>

      <View style={styles.tabs}>
        <TabButton label="Accueil" icon="home" active={screen === 'home'} onPress={() => setScreen('home')} />
        <TabButton label="Favoris" icon="favorites" active={screen === 'favorites'} badge={favoriteCount || null} onPress={() => setScreen('favorites')} />
        <TabButton label="Panier" icon="cart" active={screen === 'cart'} badge={cartCount || null} onPress={() => setScreen('cart')} />
        <TabButton label="Compte" icon="account" active={screen === 'account'} badge={unreadActivityCount || null} onPress={() => setScreen('account')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: paper,
  },
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 82 + androidTopInset,
    paddingTop: androidTopInset + 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(231,231,236,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    height: 56,
    width: 168,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerLogoImage: {
    width: 38,
    height: 48,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  logoGreen: {
    color: green,
  },
  logoRed: {
    color: red,
  },
  content: {
    padding: 20,
    paddingBottom: 132,
  },
  hero: {
    minHeight: 214,
    borderRadius: radiusLg,
    backgroundColor: ink,
    padding: 24,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    ...shadowLift,
  },
  heroCopy: {
    flex: 1,
    paddingRight: 14,
  },
  kicker: {
    color: gold,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  heroText: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 14,
    lineHeight: 20,
  },
  heroMetric: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMetricValue: {
    color: gold,
    fontSize: 24,
    fontWeight: '900',
  },
  heroMetricLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '700',
  },
  howItWorks: {
    backgroundColor: surface,
    borderRadius: radiusLg,
    borderWidth: 1,
    borderColor: line,
    padding: 16,
    marginBottom: 18,
    ...shadowSoft,
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  howItWorksTitle: {
    color: ink,
    fontSize: 17,
    fontWeight: '900',
  },
  howItWorksSubtitle: {
    alignSelf: 'flex-start',
    color: green,
    fontSize: 12,
    fontWeight: '900',
    backgroundColor: '#EEF6EF',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 12,
  },
  stepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stepCard: {
    width: '47%',
    minHeight: 112,
    borderRadius: 20,
    backgroundColor: surfaceSoft,
    borderWidth: 1,
    borderColor: 'rgba(231,231,236,0.9)',
    padding: 12,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: ink,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 9,
  },
  stepTitle: {
    color: ink,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  stepText: {
    color: muted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  searchBox: {
    height: 56,
    borderRadius: 18,
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    ...shadowSoft,
  },
  searchGlyph: {
    width: 24,
    height: 24,
    marginRight: 9,
    position: 'relative',
  },
  searchGlyphCircle: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: mutedLight,
    position: 'absolute',
    left: 2,
    top: 2,
  },
  searchGlyphHandle: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: mutedLight,
    position: 'absolute',
    right: 3,
    bottom: 5,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    color: black,
    fontSize: 15,
  },
  searchClearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchClearText: {
    color: muted,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
  },
  categories: {
    gap: 8,
    paddingRight: 18,
    marginBottom: 18,
  },
  categoryPill: {
    height: 46,
    paddingHorizontal: 15,
    borderRadius: 23,
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  categoryPillActive: {
    backgroundColor: ink,
    borderColor: ink,
  },
  categoryLabel: {
    color: '#55565C',
    fontSize: 13,
    fontWeight: '900',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  filterBar: {
    gap: 8,
    paddingRight: 18,
    marginBottom: 10,
  },
  filterChip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: line,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: green,
    borderColor: green,
  },
  filterChipText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '900',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  quickFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  quickFilterButton: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 12,
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: line,
    justifyContent: 'center',
  },
  quickFilterButtonActive: {
    backgroundColor: '#FFF8E1',
    borderColor: gold,
  },
  quickFilterText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '900',
  },
  quickFilterTextActive: {
    color: '#8A5A00',
  },
  resetFiltersButton: {
    height: 34,
    justifyContent: 'center',
  },
  resetFiltersText: {
    color: red,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: ink,
    fontSize: 22,
    fontWeight: '900',
  },
  sectionCount: {
    color: green,
    fontSize: 13,
    fontWeight: '900',
  },
  loader: {
    marginBottom: 16,
  },
  gridRow: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(231,231,236,0.9)',
    overflow: 'hidden',
    marginBottom: 14,
    ...shadowSoft,
  },
  cardUnavailable: {
    opacity: 0.72,
  },
  favoriteButton: {
    position: 'absolute',
    zIndex: 2,
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231,231,236,0.75)',
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF0F0',
    borderColor: red,
  },
  favoriteButtonText: {
    color: red,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 21,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#ECECF1',
  },
  cardBody: {
    padding: 14,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  seller: {
    flex: 1,
    color: green,
    fontSize: 10.5,
    fontWeight: '900',
  },
  discount: {
    color: '#fff',
    backgroundColor: red,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '900',
  },
  productName: {
    minHeight: 40,
    color: ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  stockBadge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 6,
  },
  stockBadgesuccess: {
    color: green,
    backgroundColor: '#F0FAF0',
  },
  stockBadgewarning: {
    color: '#8A5A00',
    backgroundColor: '#FFF8E1',
  },
  stockBadgedanger: {
    color: red,
    backgroundColor: '#FFF0F0',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 7,
  },
  stars: {
    color: '#B87900',
    fontWeight: '900',
    fontSize: 12,
  },
  reviews: {
    color: mutedLight,
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  price: {
    color: green,
    fontSize: 14,
    fontWeight: '900',
  },
  oldPrice: {
    color: '#BBB',
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: mutedLight,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '800',
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    padding: 30,
  },
  pageTitle: {
    color: ink,
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    backgroundColor: surface,
    borderWidth: 1,
    borderColor: line,
    justifyContent: 'center',
    marginBottom: 14,
    ...shadowSoft,
  },
  backButtonText: {
    color: black,
    fontSize: 13,
    fontWeight: '900',
  },
  productHero: {
    position: 'relative',
    borderRadius: radiusLg,
    overflow: 'hidden',
    backgroundColor: '#ECECF1',
    marginBottom: 14,
    ...shadowLift,
  },
  productHeroImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#ECECF1',
  },
  productFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(231,231,236,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDiscount: {
    position: 'absolute',
    top: 12,
    left: 12,
    color: '#fff',
    backgroundColor: red,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '900',
  },
  productPanel: {
    backgroundColor: surface,
    borderRadius: radiusLg,
    borderWidth: 1,
    borderColor: line,
    padding: 20,
    marginBottom: 18,
    ...shadowSoft,
  },
  productSeller: {
    alignSelf: 'flex-start',
    color: green,
    backgroundColor: '#EEF6EF',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
  },
  productTitle: {
    color: ink,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    marginBottom: 10,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 14,
    marginBottom: 14,
  },
  productPrice: {
    color: green,
    fontSize: 29,
    fontWeight: '900',
  },
  productOldPrice: {
    color: '#BBB',
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  availabilityCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  availabilityCardsuccess: {
    backgroundColor: '#F0FAF0',
    borderColor: '#DDEDDD',
  },
  availabilityCardwarning: {
    backgroundColor: '#FFF8E1',
    borderColor: '#F5E5A8',
  },
  availabilityCarddanger: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F4CCCC',
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },
  availabilityTextsuccess: {
    color: green,
  },
  availabilityTextwarning: {
    color: '#8A5A00',
  },
  availabilityTextdanger: {
    color: red,
  },
  availabilityDetail: {
    color: muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  productTrustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  trustPill: {
    color: green,
    backgroundColor: '#F0FAF0',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '900',
  },
  trustCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#F7FBF7',
    borderWidth: 1,
    borderColor: '#DDEDDD',
    borderRadius: 20,
    padding: 14,
    marginBottom: 18,
  },
  trustCardIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustCardIconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  trustCardCopy: {
    flex: 1,
  },
  trustCardTitle: {
    color: ink,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },
  trustCardText: {
    color: muted,
    fontSize: 12,
    lineHeight: 17,
  },
  productSectionTitle: {
    color: ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },
  productDescription: {
    color: '#666',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  whatsappButton: {
    minHeight: 54,
    borderRadius: 20,
    backgroundColor: '#EAF8EF',
    borderWidth: 1,
    borderColor: '#BFE8CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 18,
  },
  whatsappButtonText: {
    color: '#128C3A',
    fontSize: 14,
    fontWeight: '900',
  },
  relatedHeader: {
    marginTop: 4,
    marginBottom: 12,
  },
  relatedTitle: {
    color: black,
    fontSize: 18,
    fontWeight: '900',
  },
  relatedSubtitle: {
    color: muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  relatedList: {
    gap: 12,
    paddingRight: 18,
  },
  relatedCard: {
    width: 138,
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: line,
    padding: 10,
    ...shadowSoft,
  },
  relatedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#ECECF1',
    marginBottom: 8,
  },
  relatedName: {
    color: black,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    minHeight: 32,
  },
  relatedPrice: {
    color: green,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
  },
  favoritesHeader: {
    marginBottom: 4,
  },
  favoritesText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginTop: -10,
    marginBottom: 16,
  },
  emptyCart: {
    backgroundColor: surface,
    borderRadius: radiusLg,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: line,
    ...shadowSoft,
  },
  emptyStateIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: surfaceSoft,
    borderWidth: 1,
    borderColor: line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  emptyStateIconCompact: {
    width: 34,
    height: 34,
    borderRadius: 12,
    marginBottom: 0,
    transform: [{ scale: 0.82 }],
  },
  emptyStateHeart: {
    color: green,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
  },
  emptyStateHeartCompact: {
    fontSize: 28,
  },
  emptyBoxTop: {
    width: 30,
    height: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: green,
    transform: [{ skewX: '-18deg' }],
  },
  emptyBoxBody: {
    width: 34,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: green,
    marginTop: -1,
  },
  emptyBellDome: {
    width: 30,
    height: 28,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderWidth: 2,
    borderColor: green,
    borderBottomWidth: 0,
  },
  emptyBellBase: {
    width: 36,
    height: 2,
    borderRadius: 1,
    backgroundColor: green,
  },
  emptyBellDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: green,
    marginTop: 2,
  },
  emptyUserHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: green,
    marginBottom: 4,
  },
  emptyUserBody: {
    width: 34,
    height: 18,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    borderWidth: 2,
    borderColor: green,
    borderBottomWidth: 0,
  },
  emptyBagHandle: {
    width: 22,
    height: 13,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    borderWidth: 2,
    borderColor: green,
    borderBottomWidth: 0,
    marginBottom: -2,
  },
  emptyBagBody: {
    width: 34,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: green,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 18,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: surface,
    borderRadius: radius,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: line,
    ...shadowSoft,
  },
  cartImage: {
    width: 78,
    height: 78,
    borderRadius: 18,
    backgroundColor: '#ECECF1',
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartName: {
    color: black,
    fontWeight: '900',
    fontSize: 14,
  },
  cartSeller: {
    color: muted,
    fontWeight: '800',
    fontSize: 11,
    marginTop: 3,
  },
  cartStock: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 5,
  },
  cartStocksuccess: {
    color: green,
    backgroundColor: '#F0FAF0',
  },
  cartStockwarning: {
    color: '#8A5A00',
    backgroundColor: '#FFF8E1',
  },
  cartStockdanger: {
    color: red,
    backgroundColor: '#FFF0F0',
  },
  cartPrice: {
    color: green,
    fontWeight: '900',
    fontSize: 13,
    marginTop: 6,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFEFF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: black,
  },
  qtyText: {
    width: 34,
    textAlign: 'center',
    color: black,
    fontWeight: '900',
  },
  checkoutBox: {
    marginTop: 12,
    backgroundColor: surface,
    borderRadius: radiusLg,
    padding: 20,
    borderWidth: 1,
    borderColor: line,
    ...shadowSoft,
  },
  checkoutTitle: {
    color: black,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: line,
    paddingHorizontal: 14,
    marginBottom: 12,
    color: ink,
    backgroundColor: surfaceSoft,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  savedAddressList: {
    gap: 8,
    paddingRight: 12,
    marginBottom: 12,
  },
  savedAddressChip: {
    width: 148,
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: surfaceSoft,
    padding: 10,
    justifyContent: 'center',
  },
  savedAddressChipActive: {
    borderColor: green,
    backgroundColor: '#F0FAF0',
  },
  savedAddressLabel: {
    color: black,
    fontSize: 13,
    fontWeight: '900',
  },
  savedAddressLabelActive: {
    color: green,
  },
  savedAddressLocation: {
    color: '#777',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  savedAddressAdd: {
    width: 110,
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CFCFCF',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedAddressAddText: {
    color: black,
    fontSize: 12,
    fontWeight: '900',
  },
  fieldLabel: {
    color: black,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 10,
  },
  zoneList: {
    gap: 10,
    marginBottom: 14,
  },
  zoneCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: surfaceSoft,
    overflow: 'hidden',
  },
  zoneCardActive: {
    borderColor: ink,
    backgroundColor: surface,
  },
  zoneHeader: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  zoneTitle: {
    color: black,
    fontSize: 13,
    fontWeight: '900',
  },
  zoneSelected: {
    color: green,
    fontSize: 12,
    fontWeight: '900',
  },
  cityGrid: {
    padding: 10,
    paddingTop: 0,
    gap: 8,
  },
  cityButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#F1F1F5',
    borderWidth: 1,
    borderColor: '#ECECF1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cityButtonActive: {
    backgroundColor: '#F0FAF0',
    borderColor: green,
  },
  cityName: {
    flex: 1,
    color: black,
    fontSize: 13,
    fontWeight: '800',
  },
  cityNameActive: {
    color: green,
  },
  cityFee: {
    color: green,
    fontSize: 12,
    fontWeight: '900',
  },
  paymentList: {
    gap: 10,
    marginBottom: 8,
  },
  paymentButton: {
    minHeight: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: surfaceSoft,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentButtonActive: {
    borderColor: ink,
    backgroundColor: surface,
  },
  paymentIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ink,
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 34,
  },
  paymentCopy: {
    flex: 1,
  },
  paymentTitle: {
    color: black,
    fontSize: 14,
    fontWeight: '900',
  },
  paymentDesc: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  paymentInfo: {
    color: '#8A5A00',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#F6D78B',
    overflow: 'hidden',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  totalLabel: {
    color: '#777',
    fontWeight: '700',
  },
  totalValue: {
    color: green,
    fontSize: 18,
    fontWeight: '900',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 14,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    color: black,
    fontSize: 16,
    fontWeight: '900',
  },
  grandTotalValue: {
    color: red,
    fontSize: 20,
    fontWeight: '900',
  },
  checkoutReview: {
    borderRadius: 24,
    backgroundColor: ink,
    padding: 16,
    marginBottom: 14,
  },
  checkoutReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  checkoutReviewEyebrow: {
    color: gold,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  checkoutReviewTitle: {
    color: surface,
    fontSize: 18,
    fontWeight: '900',
  },
  checkoutReviewEdit: {
    borderRadius: 999,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  checkoutReviewEditText: {
    color: surface,
    fontSize: 12,
    fontWeight: '900',
  },
  reviewSection: {
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 12,
    marginTop: 10,
  },
  reviewSectionTitle: {
    color: mutedLight,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 7,
  },
  reviewItemName: {
    flex: 1,
    color: surface,
    fontSize: 13,
    fontWeight: '800',
  },
  reviewItemMeta: {
    color: gold,
    fontSize: 12,
    fontWeight: '900',
  },
  reviewText: {
    color: '#D6D6D8',
    fontSize: 13,
    lineHeight: 19,
  },
  reviewStrong: {
    color: gold,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 5,
  },
  reviewTotalBox: {
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    padding: 14,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewTotalLabel: {
    color: '#D6D6D8',
    fontSize: 13,
    fontWeight: '800',
  },
  reviewTotalValue: {
    color: gold,
    fontSize: 18,
    fontWeight: '900',
  },
  reviewTrustText: {
    color: '#C8C8CC',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  statusBadge: {
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  statusRowCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  primaryButton: {
    height: 56,
    borderRadius: 20,
    backgroundColor: ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    ...shadowSoft,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: surfaceSoft,
    borderWidth: 1,
    borderColor: line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
  },
  secondaryButtonText: {
    color: black,
    fontSize: 14,
    fontWeight: '900',
  },
  orderCard: {
    backgroundColor: surface,
    borderRadius: radius,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCEBDD',
    marginBottom: 14,
    ...shadowSoft,
  },
  orderEyebrow: {
    color: green,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 6,
  },
  orderNumber: {
    color: black,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  orderLabel: {
    color: '#777',
    fontWeight: '700',
  },
  orderValue: {
    color: black,
    fontWeight: '900',
  },
  orderDate: {
    color: '#777',
    fontSize: 13,
    fontWeight: '700',
  },
  accountTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: line,
    padding: 5,
    gap: 4,
    marginBottom: 14,
    ...shadowSoft,
  },
  accountTab: {
    flexGrow: 1,
    flexBasis: '22%',
    height: 40,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTabActive: {
    backgroundColor: ink,
  },
  accountTabText: {
    color: '#777',
    fontSize: 12,
    fontWeight: '900',
  },
  accountTabTextActive: {
    color: '#fff',
  },
  activityPreview: {
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: line,
    padding: 16,
    gap: 8,
    ...shadowSoft,
  },
  activityPreviewHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityPreviewTitle: {
    color: black,
    fontSize: 15,
    fontWeight: '900',
  },
  activityPreviewLink: {
    color: green,
    fontSize: 12,
    fontWeight: '900',
  },
  activityMiniItem: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    paddingTop: 8,
  },
  activityMiniHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityMiniTitle: {
    flex: 1,
    color: black,
    fontSize: 13,
    fontWeight: '900',
  },
  activityMiniDescription: {
    color: '#666',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  activityMiniDate: {
    color: '#777',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  unreadDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: red,
  },
  activityCenter: {
    gap: 10,
  },
  activitySubtitle: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: line,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    ...shadowSoft,
  },
  activityCardUnread: {
    borderColor: '#DCEBDD',
    backgroundColor: '#FAFFFA',
  },
  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconText: {
    fontSize: 17,
    fontWeight: '900',
  },
  activityCopy: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  activityTitle: {
    flex: 1,
    color: black,
    fontSize: 14,
    fontWeight: '900',
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: red,
  },
  activityDescription: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  activityMeta: {
    color: '#999',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  activityActionPill: {
    alignSelf: 'flex-start',
    backgroundColor: ink,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 10,
  },
  activityActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  addressForm: {
    backgroundColor: surface,
    borderRadius: radiusLg,
    borderWidth: 1,
    borderColor: line,
    padding: 20,
    marginBottom: 14,
    ...shadowSoft,
  },
  addressFormHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressZoneRow: {
    gap: 8,
    marginBottom: 12,
  },
  addressZoneButton: {
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: surfaceSoft,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  addressZoneButtonActive: {
    backgroundColor: ink,
    borderColor: ink,
  },
  addressZoneText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '900',
  },
  addressZoneTextActive: {
    color: '#fff',
  },
  addressCityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  addressCityButton: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: surfaceSoft,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  addressCityButtonActive: {
    backgroundColor: '#F0FAF0',
    borderColor: green,
  },
  addressCityText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '900',
  },
  addressCityTextActive: {
    color: green,
  },
  defaultToggle: {
    minHeight: 42,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  defaultToggleActive: {
    backgroundColor: '#FFF8E1',
    borderColor: gold,
  },
  defaultToggleText: {
    color: '#777',
    fontSize: 13,
    fontWeight: '900',
  },
  defaultToggleTextActive: {
    color: '#8A5A00',
  },
  addressList: {
    gap: 10,
  },
  addressCard: {
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: line,
    padding: 16,
    ...shadowSoft,
  },
  addressCardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  addressCardTitle: {
    color: black,
    fontSize: 16,
    fontWeight: '900',
  },
  addressDefaultText: {
    color: green,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  addressUseButton: {
    height: 34,
    borderRadius: 17,
    backgroundColor: ink,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  addressUseText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  addressText: {
    color: black,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  addressLocation: {
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  addressAction: {
    height: 32,
    justifyContent: 'center',
  },
  addressActionText: {
    color: black,
    fontSize: 12,
    fontWeight: '900',
  },
  addressDeleteText: {
    color: red,
  },
  profileForm: {
    marginTop: 16,
  },
  ordersState: {
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: line,
    padding: 26,
    alignItems: 'center',
    gap: 10,
    ...shadowSoft,
  },
  ordersStateText: {
    color: '#777',
    fontSize: 13,
    fontWeight: '700',
  },
  ordersList: {
    gap: 10,
  },
  ordersHeader: {
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: line,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    ...shadowSoft,
  },
  ordersHeaderTitle: {
    color: black,
    fontSize: 16,
    fontWeight: '900',
  },
  refreshButton: {
    height: 34,
    borderRadius: 17,
    backgroundColor: surfaceSoft,
    borderWidth: 1,
    borderColor: line,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: black,
    fontSize: 12,
    fontWeight: '900',
  },
  orderListCard: {
    minHeight: 92,
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: line,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...shadowSoft,
  },
  orderListIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderListInfo: {
    flex: 1,
  },
  orderListNumber: {
    color: black,
    fontSize: 15,
    fontWeight: '900',
  },
  orderListDate: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
  },
  orderListRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  orderListTotal: {
    color: green,
    fontSize: 13,
    fontWeight: '900',
  },
  orderListArrow: {
    color: '#999',
    fontSize: 24,
    fontWeight: '500',
  },
  orderDetailCard: {
    backgroundColor: surface,
    borderRadius: radiusLg,
    borderWidth: 1,
    borderColor: line,
    padding: 20,
    marginBottom: 14,
    ...shadowSoft,
  },
  orderCustomerMessage: {
    backgroundColor: '#F7FBF7',
    borderWidth: 1,
    borderColor: '#DDEDDD',
    borderRadius: 20,
    padding: 14,
    marginTop: 14,
  },
  orderCustomerMessageTitle: {
    color: green,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 5,
  },
  orderCustomerMessageText: {
    color: '#48604B',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  paymentNotice: {
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F6D78B',
    padding: 12,
    marginTop: 14,
  },
  paymentNoticeTitle: {
    color: '#8A5A00',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 5,
  },
  paymentNoticeText: {
    color: '#8A5A00',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  customerProgressBox: {
    backgroundColor: surfaceSoft,
    borderRadius: 22,
    padding: 14,
    marginTop: 16,
    marginBottom: 18,
  },
  customerStep: {
    flexDirection: 'row',
    gap: 12,
  },
  customerStepRail: {
    width: 30,
    alignItems: 'center',
  },
  customerStepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EDEDF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerStepDotDone: {
    backgroundColor: green,
  },
  customerStepDotActive: {
    backgroundColor: gold,
  },
  customerStepDotBlocked: {
    backgroundColor: red,
  },
  customerStepDotText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '900',
  },
  customerStepDotTextActive: {
    color: '#fff',
  },
  customerStepLine: {
    width: 2,
    flex: 1,
    minHeight: 34,
    backgroundColor: '#E1E1E6',
  },
  customerStepLineDone: {
    backgroundColor: green,
  },
  customerStepCopy: {
    flex: 1,
    paddingBottom: 14,
  },
  customerStepTitle: {
    color: black,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  customerStepTitleActive: {
    color: green,
  },
  customerStepText: {
    color: '#777',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  orderItemImage: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#ECECF1',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    color: black,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  orderItemMeta: {
    color: '#777',
    fontSize: 12,
    marginTop: 3,
  },
  orderItemPrice: {
    color: green,
    fontSize: 12,
    fontWeight: '900',
  },
  orderSummary: {
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    marginTop: 8,
    paddingTop: 8,
  },
  deliveryCard: {
    backgroundColor: surfaceSoft,
    borderRadius: 20,
    padding: 12,
    marginTop: 14,
  },
  deliveryAddress: {
    color: black,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  deliveryLocation: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  timelineBox: {
    backgroundColor: surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: line,
    padding: 16,
    ...shadowSoft,
  },
  timelineTitle: {
    color: black,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  timelineEmpty: {
    color: '#777',
    fontSize: 13,
    lineHeight: 19,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  timelineIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconText: {
    fontSize: 16,
    fontWeight: '900',
  },
  timelineCopy: {
    flex: 1,
  },
  timelineHead: {
    gap: 4,
  },
  timelineEventTitle: {
    color: black,
    fontSize: 13,
    fontWeight: '900',
  },
  timelineDate: {
    color: '#999',
    fontSize: 11,
    fontWeight: '700',
  },
  timelineDescription: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  timelineActor: {
    color: '#AAA',
    fontSize: 11,
    marginTop: 5,
    fontWeight: '700',
  },
  accountCard: {
    backgroundColor: surface,
    borderRadius: radiusLg,
    padding: 24,
    borderWidth: 1,
    borderColor: line,
    ...shadowSoft,
  },
  accountTitle: {
    color: black,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  accountText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 21,
  },
  accountStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  accountStat: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: surfaceSoft,
    borderWidth: 1,
    borderColor: line,
    padding: 12,
  },
  accountStatValue: {
    color: green,
    fontSize: 22,
    fontWeight: '900',
  },
  accountStatLabel: {
    color: '#777',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  authSwitch: {
    flexDirection: 'row',
    backgroundColor: surfaceSoft,
    borderRadius: 20,
    padding: 4,
    marginTop: 18,
    marginBottom: 14,
  },
  authSwitchButton: {
    flex: 1,
    height: 38,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authSwitchButtonActive: {
    backgroundColor: ink,
  },
  authSwitchText: {
    color: '#777',
    fontSize: 13,
    fontWeight: '900',
  },
  authSwitchTextActive: {
    color: '#fff',
  },
  tabs: {
    height: 74,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(231,231,236,0.9)',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    marginHorizontal: 14,
    marginBottom: Platform.OS === 'ios' ? 10 : 12,
    ...shadowLift,
  },
  tabButton: {
    width: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGlyph: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconText: {
    fontSize: 25,
    lineHeight: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  homeRoof: {
    width: 15,
    height: 15,
    borderLeftWidth: 2.4,
    borderTopWidth: 2.4,
    borderTopLeftRadius: 2,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    top: 3,
  },
  homeBase: {
    width: 17,
    height: 14,
    borderWidth: 2.4,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    position: 'absolute',
    bottom: 3,
  },
  bagHandle: {
    width: 11,
    height: 8,
    borderTopWidth: 2.3,
    borderLeftWidth: 2.3,
    borderRightWidth: 2.3,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    position: 'absolute',
    top: 3,
  },
  bagBody: {
    width: 19,
    height: 16,
    borderWidth: 2.3,
    borderRadius: 5,
    position: 'absolute',
    bottom: 2,
  },
  userHead: {
    width: 10,
    height: 10,
    borderWidth: 2.3,
    borderRadius: 5,
    position: 'absolute',
    top: 3,
  },
  userBody: {
    width: 19,
    height: 10,
    borderWidth: 2.3,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 0,
    position: 'absolute',
    bottom: 2,
  },
  tabLabel: {
    marginTop: 2,
    color: mutedLight,
    fontSize: 11,
    fontWeight: '900',
  },
  tabActive: {
    color: green,
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <KkiapayProvider>
        <MainApp />
      </KkiapayProvider>
    </SafeAreaProvider>
  );
}
