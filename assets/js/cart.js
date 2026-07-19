/* ===== Warenkorb-Logik (localStorage) =====
   Der Warenkorb ist bewusst einfach gehalten: ein Array aus
   { id, quantity } in localStorage. Die Produktdetails (Name, Preis, ...)
   werden bei Bedarf aus products.js nachgeschlagen. */

const CART_STORAGE_KEY = "gtm_demo_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, quantity) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity: quantity });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function setQuantity(productId, quantity) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
}

function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadge();
}

/** Warenkorb-Einträge inkl. voller Produktdaten (Name, Preis, Icon, ...). */
function getCartWithProductData() {
  return getCart()
    .map(item => {
      const product = getProductById(item.id);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean);
}

function getCartTotal() {
  return getCartWithProductData().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
