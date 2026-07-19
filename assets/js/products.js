/* ===== Produktkatalog (Demo-Daten) =====
   Zentrale Datenquelle für Shop-Liste, Produktdetail, Warenkorb & Kasse.
   Preise sind Netto-Demo-Werte in EUR. */

const PRODUCTS = [
  { id: 1, sku: "ELK-001", name: "Kabellose Kopfhörer", category: "Elektronik", price: 79.99, icon: "🎧",
    description: "Over-Ear Kopfhörer mit aktiver Geräuschunterdrückung und 30h Akkulaufzeit." },
  { id: 2, sku: "ELK-002", name: "Smartwatch Pulse", category: "Elektronik", price: 149.00, icon: "⌚",
    description: "Fitness-Tracker mit Herzfrequenzmessung, GPS und 5 Tagen Akkulaufzeit." },
  { id: 3, sku: "MOD-001", name: "Bio-Baumwoll Hoodie", category: "Mode", price: 54.90, icon: "🧥",
    description: "Kuscheliger Hoodie aus 100% Bio-Baumwolle, unisex geschnitten." },
  { id: 4, sku: "MOD-002", name: "Canvas Sneaker", category: "Mode", price: 64.50, icon: "👟",
    description: "Leichter Sneaker aus recyceltem Canvas-Gewebe." },
  { id: 5, sku: "ZUH-001", name: "Duftkerze Zeder", category: "Zuhause", price: 18.90, icon: "🕯️",
    description: "Handgegossene Sojawachskerze mit Zeder- und Vanilleduft, 40h Brenndauer." },
  { id: 6, sku: "ZUH-002", name: "Keramik-Pflanzentopf", category: "Zuhause", price: 24.00, icon: "🪴",
    description: "Minimalistischer Pflanzentopf mit Drainageloch, Ø 16 cm." },
  { id: 7, sku: "SPO-001", name: "Yoga-Matte Pro", category: "Sport", price: 39.99, icon: "🧘",
    description: "Rutschfeste 6mm Yoga-Matte aus TPE-Material, inkl. Tragegurt." },
  { id: 8, sku: "SPO-002", name: "Trinkflasche 750ml", category: "Sport", price: 22.50, icon: "🚰",
    description: "Doppelwandige Edelstahl-Trinkflasche, hält 24h kalt." }
];

const CURRENCY = "EUR";

function getProductById(id) {
  return PRODUCTS.find(p => p.id === Number(id));
}

function getCategories() {
  return [...new Set(PRODUCTS.map(p => p.category))];
}

/* Wandelt ein Produkt (+ optionale Menge) in ein GA4-Ecommerce "item"-Objekt um. */
function toGa4Item(product, quantity) {
  return {
    item_id: product.sku,
    item_name: product.name,
    item_category: product.category,
    price: product.price,
    quantity: quantity || 1
  };
}
