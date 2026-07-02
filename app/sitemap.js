import { EVENTS } from './_components/data.jsx';

const BASE = 'https://summer.jungle.baby';

// Public, indexable static pages (excludes /admin).
const STATIC_PATHS = [
  '',
  '/about',
  '/contact',
  '/faq',
  '/partnership',
  '/privacy-policy',
  '/refund-and-cancellation-policy',
  '/terms-of-use',
];

export default function sitemap() {
  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.5,
  }));

  const eventEntries = EVENTS
    .filter((e) => e && e.id && e.status !== 'inactive')
    .map((e) => ({
      url: `${BASE}/${encodeURIComponent(e.id)}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...staticEntries, ...eventEntries];
}
