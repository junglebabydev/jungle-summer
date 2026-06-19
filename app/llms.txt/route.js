import { EVENTS } from '../_components/data.jsx';

const BASE = 'https://summer.jungle.baby';

export const dynamic = 'force-static';

export function GET() {
  const active = EVENTS.filter((e) => e && e.id && e.status !== 'inactive');

  const listings = active
    .map((e) => {
      const meta = [
        e.area,
        e.ageLabel ? `ages ${e.ageLabel}` : null,
        e.priceDisplay,
        e.dates,
        e.venue,
      ]
        .filter(Boolean)
        .join(' · ');
      const desc = e.blurb ? ` ${e.blurb}` : '';
      return `- [${e.title}](${BASE}/${e.id})${meta ? ` — ${meta}` : ''}${desc}`;
    })
    .join('\n');

  const body = `# Jungle Summer — Things to Do with Kids in Singapore

> A curated guide to children's activities, camps, shows, workshops and family events happening across Singapore this summer. Part of Jungle (https://www.jungle.baby), Singapore's marketplace for kids' activities and bookings.

## About

Jungle Summer helps parents in Singapore find things to do with their children — sorted by age, location, date and price. Listings span free and paid events across Central, East, West, North and North-East Singapore, covering museums, libraries, the outdoors, workshops, shows and seasonal festivals.

- Site: ${BASE}
- Parent marketplace: https://www.jungle.baby
- Contact: ${BASE}/contact
- For activity providers / partners: ${BASE}/partnership

## How to use this site

- Browse all listings on the homepage (${BASE}) and filter by child age, location, date and price.
- Each event has its own page at ${BASE}/<event-id> with full details, venue, dates and a link to book or learn more.
- Listings are free to submit via the partnership page.

## Listings (${active.length})

${listings}

---
This file is provided for large language models and AI search engines. For the most current information, visit ${BASE}.
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
