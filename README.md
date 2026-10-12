# Mr. Cheese · Catering & Eventgastronomie

Responsive, German B2B catering website for eNBe Gastro, Nemo Borowski, Rostock.

## Run

Node.js 20+; no external build dependencies.

```
npm run build
npm test
npm run dev
```

Deploy `dist/`. Each service and event has a complete server-readable HTML page. Hosting must preserve directory index routes. Canonicals and sitemap target the intended production domain `https://www.raclette-catering.com/`; change them if the permanent domain changes.

## Requests

The event enquiry builds a mailto email locally. No silent submission and no lead database. A visible copy fallback remains available. Phone and email links work independently. Before replacing this with server-side submission, configure an actual delivery destination, privacy text, retention and spam protection.

## Content & identity

Original content extracted from all discovered pages of raclette-catering.com and the specified Kleinanzeigen ad, 12 October 2026. Company details confirmed by the user: eNBe Gastro, Nemo Borowski, Lessingstraße 13, 18055 Rostock. No GmbH status, registration or VAT ID has been invented. No copied legal placeholders, obsolete TMG reference or closed OS platform link. Confirm whether an existing VAT ID or registry entry needs to be added. Hosting details and agreements must be kept aligned with the live provider.

Corporate emphasis: full event gastronomy, known Mr. Cheese brand retained, Desaster Bar positioned as separate bar brand. 18 pages plus 404, individual SEO titles/descriptions, Open Graph, sitemap, canonical links and FoodEstablishment structured data. No invented reviews, client logos, scarcity or prices. 20–500 guests comes from the supplied current ad.

## Visual assets

Customer photos are downloaded locally and converted to WebP. `public/assets/sources.json` records source URLs, sizes and errors. All 34 discovered customer/background assets are retained; the website selects authentic useful event/food photos rather than generic hidden stock illustrations. Raster logo extracted from the supplied flyer and traced into `mr-cheese-logo.svg`; contour fidelity is limited by the resolution of the supplied artwork, which should eventually be replaced with the original brand vector if available.

Typeface identification from a raster flyer is approximate: Poppins body, Anton display, Oswald compact headlines, all locally hosted. Their official upstream licenses are retained in assets. Color direction follows the supplied charcoal/gold flyers. Photograph grade uses CSS saturation, contrast and slight warm tint, preserving originals.

Gradore credit: official current logo fetched from https://gradore.de/gradore-logo-optimized.webp, with required referral link.

## Motion & accessibility

Original CSS/JS implementations inspired by BurgerFuel, not copied source or media. Implemented families: word/hero reveal, staggered section reveal, scroll highlight, parallax, continuous text marquee, card image zoom and text rotation, fold/flip numerals, rotating motif, responsive horizontal photo carousel, animated menu and custom scroll-driven dripping cheese transition. BurgerFuel's unrelated live radio and promotional video are not imported. Reduced-motion support and explicit motion pause, keyboard focus, labelled controls, native details, accessible dialog, responsive navigation and no-JavaScript visible content.

Design research references:
- https://www.burgerfuel.com/
- https://dribbble.com/shots/26503709-Le-Festin-French-Catering-Website-Concept
- https://dribbble.com/shots/26142224-Food-Truck-website
- https://www.squarespace.com/templates/browse/topic/restaurants/type/launch-page

No external animation asset used; all motion is created in the project. No tracking or third-party font/image requests.
