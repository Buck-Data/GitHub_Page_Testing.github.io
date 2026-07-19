# GTM Lernshop

Eine kleine, statische Demo-Website (reines HTML/CSS/JS, kein Build-Schritt), gedacht als **Übungsplatz für Google Tag Manager (GTM) und GA4**. Es gibt keine echten Produkte und keine echte Bestellung – der komplette Shop läuft im Browser über `localStorage`/`sessionStorage`.

Die Seite deckt bewusst den kompletten GA4-Ecommerce-Funnel plus die gängigsten Custom Events ab, damit du in GTM möglichst viele reale Szenarien nachbauen kannst: Trigger anlegen, Variablen aus dem dataLayer auslesen, Tags feuern lassen, in GA4 die Berichte/Explorationen prüfen.

## Live-Vorschau lokal testen

Einfach `index.html` im Browser öffnen (funktioniert auch ohne lokalen Server, da alles auf `file://` läuft). Für GitHub Pages: Repo-Einstellungen → **Pages** → Branch `main`, Ordner `/ (root)` → Speichern. Nach ein paar Minuten ist die Seite unter `https://<dein-user>.github.io/<repo-name>/` erreichbar.

## Setup: GTM & GA4 verbinden

1. **GTM-Container anlegen**: [tagmanager.google.com](https://tagmanager.google.com) → Konto/Container für "Web" erstellen. Du bekommst eine ID im Format `GTM-XXXXXXX`.
2. **ID in allen Dateien eintragen**: Jede HTML-Seite enthält den Platzhalter `GTM-XXXXXXX` zweimal (Kopf-Snippet + `<noscript>`-Snippet direkt nach `<body>`). Ersetze ihn überall durch deine echte ID, z.B. per Suchen-und-Ersetzen im Editor, oder mit diesem PowerShell-Einzeiler im Projektordner:
   ```powershell
   Get-ChildItem -Filter *.html | ForEach-Object {
     (Get-Content $_.FullName -Raw) -replace 'GTM-XXXXXXX', 'GTM-DEINE-ID' | Set-Content $_.FullName -Encoding utf8
   }
   ```
3. **GA4-Property anlegen**: [analytics.google.com](https://analytics.google.com) → Property erstellen → Datenstrom "Web" → Measurement-ID (`G-XXXXXXX`) notieren.
4. **In GTM verbinden**: Neuer Tag → Typ "Google Analytics: GA4-Konfiguration" → Measurement-ID eintragen → Trigger "All Pages" (Initialisierung). Danach für jedes Event unten einen eigenen **GA4-Ereignis-Tag** anlegen (Typ "Google Analytics: GA4-Ereignis"), der auf dieser Konfigurations-Tag verweist.
5. **Container veröffentlichen** (Submit) und Seite auf GitHub Pages deployen bzw. lokal testen.

## Der Event-Monitor

Unten rechts auf jeder Seite gibt es ein aufklappbares Panel **"📊 Event-Monitor"**. Es zeigt jeden `dataLayer.push()`, den diese Seite auslöst, live inklusive Payload – so siehst du sofort, was passiert, ohne die Konsole öffnen zu müssen.

**Wichtig:** Das Panel zeigt nur die *bewusst gebauten* Custom Events dieser Seite. Interne GTM-Events (`gtm.js`, `gtm.dom`, `gtm.load`, `gtm.click` etc.) und was GTM daraus an Tags feuert, siehst du nur im **[GTM-Vorschaumodus (Preview)](https://support.google.com/tagmanager/answer/6107056)** – das bleibt dein Haupt-Werkzeug zum Debuggen.

## Alle Events auf einen Blick

| Event (dataLayer `event`) | Seite | Wann? | Wichtige Parameter |
|---|---|---|---|
| `view_item_list` | Start, Shop | Beim Laden / bei Filter- oder Suchänderung | `item_list_name`, `ecommerce.items[]` |
| `select_item` | Shop | Klick auf ein Produkt in der Liste | `item_list_name`, `ecommerce.items[]` |
| `search` | Shop | Sucheingabe (mit Debounce) | `search_term` |
| `view_item` | Produktdetail | Beim Laden der Detailseite | `ecommerce.value`, `ecommerce.items[]` |
| `add_to_cart` | Produktdetail, Warenkorb | Klick auf "In den Warenkorb" / Menge erhöhen | `ecommerce.value`, `ecommerce.items[]` |
| `remove_from_cart` | Warenkorb | Artikel entfernen / Menge verringern | `ecommerce.value`, `ecommerce.items[]` |
| `view_cart` | Warenkorb | Beim Laden, wenn Warenkorb nicht leer ist | `ecommerce.value`, `ecommerce.items[]` |
| `begin_checkout` | Kasse | Beim Laden der Kassenseite | `ecommerce.value`, `ecommerce.items[]` |
| `add_shipping_info` | Kasse | Versandart ausgewählt | `shipping_tier` |
| `add_payment_info` | Kasse | Zahlungsart ausgewählt | `payment_type` |
| `purchase` | Bestellbestätigung | Einmalig nach Bestellabschluss | `transaction_id`, `value`, `tax`, `shipping`, `items[]` |
| `generate_lead` | Start/Footer, Kontakt | Newsletter-Anmeldung / Kontaktformular | `form_name`, `lead_type` |
| `form_submit` | Kontakt | Formularabsendung | `form_name` |
| `page_not_found` | 404-Seite | Beim Aufruf einer nicht existierenden URL | `page_path`, `referrer` |
| `scroll_depth` | alle Seiten | Bei 25/50/75/90% Scrolltiefe | `percent_scrolled` |
| `outbound_click` | alle Seiten | Klick auf einen Link zu einer fremden Domain | `link_url`, `link_domain` |
| `file_download` | alle Seiten | Klick auf einen Link zu `.pdf/.zip/.docx/...` | `link_url`, `file_name` |

Alle Ecommerce-Events (`view_item_list` bis `purchase`) folgen dem offiziellen [GA4-Ecommerce-Schema](https://developers.google.com/tag-platform/tag-manager/datalayer#example_data_layer_code_for_ecommerce) inkl. `dataLayer.push({ecommerce: null})`-Reset vor jedem neuen Event.

**Bewusster Hinweis:** `scroll_depth`, `outbound_click` und `file_download` sammelt GA4 über die *Enhanced Measurement*-Einstellungen im Datenstrom eigentlich automatisch (dort heißen sie `scroll`, `click` und `file_download`). Hier sind sie manuell nachgebaut, damit du im GTM-Vorschaumodus den Unterschied zwischen automatischer GA4-Erfassung und einem selbst gebauten dataLayer-Event/Custom-Event-Trigger direkt vergleichen kannst.

## Vorschlag für die Übungsreihenfolge

1. GA4-Konfigurations-Tag mit "All Pages"-Trigger bauen, in GTM-Vorschau prüfen, dass er auf jeder Seite feuert.
2. Einen Custom-Event-Trigger für `view_item` bauen + GA4-Ereignis-Tag mit den Ecommerce-Daten aus Datenschicht-Variablen.
3. Den kompletten Funnel `view_item_list → select_item → view_item → add_to_cart → view_cart → begin_checkout → add_shipping_info/add_payment_info → purchase` nachbauen und in GA4 unter **Berichte → Monetarisierung → Kauf-Verhalten** (bzw. per Exploration) den Trichter ansehen.
4. `generate_lead`/`form_submit` als Conversion in GA4 markieren.
5. `page_not_found` tracken und in GA4 einen benutzerdefinierten Bericht für kaputte Seiten bauen.
6. Enhanced Measurement in GA4 aktivieren und die automatischen `scroll`/`click`/`file_download`-Events mit den manuellen hier vergleichen (Duplikate erkennen, verstehen wann welches greift).
7. GA4 DebugView zusätzlich zum GTM-Vorschaumodus nutzen, um zu sehen, was tatsächlich an GA4 ankommt.

## Projektstruktur

```
index.html                 Startseite
produkte.html               Shop-Übersicht (Suche, Kategorie-Filter)
produkt.html?id=            Produktdetail
warenkorb.html               Warenkorb
kasse.html                   Checkout (Versand/Zahlung)
bestellbestaetigung.html     Bestellbestätigung (purchase-Event)
kontakt.html                  Kontaktformular + Test-Links
404.html                      Fehlerseite
assets/css/style.css          Styles
assets/js/products.js          Produktkatalog (Demo-Daten)
assets/js/cart.js              Warenkorb-Logik (localStorage)
assets/js/analytics.js         trackEvent()-Helper, Event-Monitor, Auto-Tracking
assets/files/agb-demo.pdf       Test-Datei für file_download
```

Der Warenkorb liegt in `localStorage` (Key `gtm_demo_cart`), die letzte Bestellung kurzzeitig in `sessionStorage` (Key `gtm_demo_last_order`) – beides kannst du in den DevTools unter **Application → Storage** jederzeit einsehen oder zurücksetzen.
