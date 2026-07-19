/* =====================================================================
   analytics.js – zentrale Stelle für alles, was Richtung dataLayer geht.

   Lernziel: Jedes Event, das diese Demo-Seite auslöst, läuft durch
   trackEvent(). So siehst du an EINER Stelle im Code, welche Events es
   gibt – und im Event-Monitor unten rechts siehst du sie live im Browser,
   ohne extra die Konsole öffnen zu müssen.

   Wichtig: Dieser Monitor ersetzt NICHT den GTM Preview Mode. Er zeigt
   nur die Events, die diese Seite bewusst per trackEvent() pusht – nicht
   die internen GTM-Events (gtm.js, gtm.dom, gtm.click, ...). Für die
   komplette Sicht (inkl. welche Tags feuern) nutzt du GTM Preview.
   ===================================================================== */

window.dataLayer = window.dataLayer || [];

let eventLog = [];

/**
 * Pusht ein Event in den dataLayer und protokolliert es im Event-Monitor.
 * @param {Object} eventData - z.B. { event: 'add_to_cart', ecommerce: {...} }
 */
function trackEvent(eventData) {
  window.dataLayer.push(eventData);
  eventLog.unshift({ data: eventData, time: new Date() });
  if (eventLog.length > 50) eventLog.pop();
  renderEventMonitor();
  console.log("%c[dataLayer.push]", "color:#4f46e5;font-weight:bold;", eventData);
}

/** Standard-Ecommerce-Event: löscht vorher das alte ecommerce-Objekt (Google-Empfehlung). */
function trackEcommerceEvent(eventName, ecommerce) {
  trackEvent({ ecommerce: null });
  trackEvent({ event: eventName, ecommerce: ecommerce });
}

/* ---------------------------------------------------------------------
   Event-Monitor UI (nur ein Lernhilfsmittel, kein Analytics-Tool)
   --------------------------------------------------------------------- */
function buildEventMonitor() {
  if (document.getElementById("event-monitor")) return;

  const panel = document.createElement("div");
  panel.id = "event-monitor";
  panel.innerHTML = `
    <div id="event-monitor-header">
      <span>📊 Event-Monitor <span id="event-monitor-count">0</span></span>
      <button id="event-monitor-clear" type="button">leeren</button>
    </div>
    <div id="event-monitor-list"></div>
  `;
  document.body.appendChild(panel);

  document.getElementById("event-monitor-header").addEventListener("click", (e) => {
    if (e.target.id === "event-monitor-clear") return;
    panel.classList.toggle("open");
  });
  document.getElementById("event-monitor-clear").addEventListener("click", (e) => {
    e.stopPropagation();
    eventLog = [];
    renderEventMonitor();
  });
}

function renderEventMonitor() {
  const list = document.getElementById("event-monitor-list");
  const count = document.getElementById("event-monitor-count");
  if (!list || !count) return;

  count.textContent = eventLog.length;
  list.innerHTML = eventLog.map(entry => {
    const timeStr = entry.time.toLocaleTimeString("de-DE");
    const name = entry.data.event || (entry.data.ecommerce === null ? "(ecommerce reset)" : "(push)");
    const json = JSON.stringify(entry.data, null, 2);
    return `<div class="event-entry">
      <span class="event-entry-name">${name}</span>
      <span class="event-entry-time">${timeStr}</span>
      <pre>${json}</pre>
    </div>`;
  }).join("");
}

/* ---------------------------------------------------------------------
   Toast-Hinweis (z.B. "In den Warenkorb gelegt")
   --------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------------------------------------------------------------------
   Automatisch erfasste Interaktionen.

   Hinweis: GA4 sammelt "outbound click", "file_download" und "scroll"
   normalerweise automatisch über die Enhanced-Measurement-Einstellungen
   in der GA4-Konfiguration. Hier bilden wir sie bewusst manuell über
   den dataLayer nach, damit du den Unterschied zwischen automatischer
   GA4-Erfassung und einem manuell gebauten GTM-Trigger/Tag verstehst
   und beides miteinander vergleichen kannst.
   --------------------------------------------------------------------- */
function initAutoTracking() {
  const scrollThresholds = [25, 50, 75, 90];
  const firedThresholds = new Set();

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const percent = Math.round((scrollTop / docHeight) * 100);
    scrollThresholds.forEach(threshold => {
      if (percent >= threshold && !firedThresholds.has(threshold)) {
        firedThresholds.add(threshold);
        trackEvent({ event: "scroll_depth", percent_scrolled: threshold, page_path: location.pathname });
      }
    });
  }, { passive: true });

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link || !link.href) return;

    const isExternal = link.hostname && link.hostname !== location.hostname;
    const isDownload = /\.(pdf|zip|docx?|xlsx?|pptx?|csv)$/i.test(link.pathname);

    if (isDownload) {
      trackEvent({
        event: "file_download",
        link_url: link.href,
        file_name: link.pathname.split("/").pop(),
        file_extension: link.pathname.split(".").pop()
      });
    } else if (isExternal) {
      trackEvent({
        event: "outbound_click",
        link_url: link.href,
        link_domain: link.hostname
      });
    }
  });
}

/* ---------------------------------------------------------------------
   Warenkorb-Badge in der Navigation aktuell halten (auf jeder Seite)
   --------------------------------------------------------------------- */
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;
  const cart = typeof getCart === "function" ? getCart() : [];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

/* ---------------------------------------------------------------------
   Newsletter-Formular im Footer (auf jeder Seite vorhanden)
   --------------------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    trackEvent({
      event: "generate_lead",
      form_name: "newsletter",
      lead_type: "newsletter_signup"
    });
    showToast("Danke! Du bist jetzt für den Newsletter angemeldet (Demo).");
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildEventMonitor();
  initAutoTracking();
  updateCartBadge();
  initNewsletterForm();
});
