export function mergeProducts(primaryProducts = [], fallbackProducts = []) {
  const productsById = new Map();

  fallbackProducts.forEach(product => {
    productsById.set(String(product.id), product);
  });
  primaryProducts.forEach(product => {
    productsById.set(String(product.id), product);
  });

  return Array.from(productsById.values()).filter(product => (
    product?.id && product?.name && Number(product?.price) >= 0 && product?.img
  ));
}

export function getProductStock(product) {
  const stock = Number(product?.stock ?? product?.quantity ?? product?.stock_quantity);
  return Number.isFinite(stock) ? stock : null;
}

export function getAvailability(product) {
  if (product?.available === false || product?.is_available === false) {
    return { label: 'Indisponible', tone: 'danger' };
  }

  const stock = getProductStock(product);
  if (stock === null) return { label: 'Disponibilité à confirmer', tone: 'warning' };
  if (stock <= 0) return { label: 'Indisponible', tone: 'danger' };
  if (stock <= 3) return { label: `Plus que ${stock}`, tone: 'warning' };
  return { label: 'Disponible', tone: 'success' };
}

export function searchProduct(product, query = '') {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    product?.name,
    product?.category,
    product?.badge,
    product?.description,
  ].some(value => String(value || '').toLowerCase().includes(normalizedQuery));
}
