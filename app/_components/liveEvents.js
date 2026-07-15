// ============================================================
// liveEvents.js — single source of truth for fetching + normalizing
// live things_to_do rows into the app's event shape.
//
// Both Browse.jsx and Landing.jsx must use this (not their own copies) —
// two independent implementations is exactly how Landing's rails ended up
// silently reading frozen data.jsx dates while Browse read live Supabase
// data. Only one fetch/transform path from here on.
// ============================================================
import { supabase } from '@/lib/supabase';
import { EVENTS as FALLBACK_EVENTS } from './data.jsx';

// Supabase → app vocabulary normalisation. The things_to_do table stores
// lowercase values (type:"show", area:"central", age_band:["all_ages"])
// and has no `when` column, while FILTERS/match expect capitalised keys
// and a `when` array (today/weekend/week/june).
const TYPE_MAP = {
  attraction: "Attraction", outdoor: "Outdoor", show: "Show",
  museum: "Museum", festival: "Festival", library: "Library",
  free_event: "Free event",
};
const AREA_MAP = {
  central: "Central", west: "West", north: "North",
  east: "East", "north-east": "North-East",
};
export const normType = (t) => TYPE_MAP[(t || "").toLowerCase()] || (t || "");
export const normArea = (a) => AREA_MAP[(a || "").toLowerCase()] || (a || "");
export const normAge = (bands) => {
  const arr = Array.isArray(bands) ? bands : bands ? [bands] : ["all"];
  return arr.map((b) => (b === "all_ages" ? "all" : b));
};

// Derive the when-buckets (today/weekend/week/june) an event falls into,
// from its start/end dates relative to TODAY (computed fresh on every call —
// this is what makes "Happening this week" actually mean this week, instead
// of whatever was true when a static snapshot was generated). Events without
// dates default to ['june'] so they still appear under "All June".
export function deriveWhen(startStr, endStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parse = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d) ? null : (d.setHours(0, 0, 0, 0), d);
  };
  const start = parse(startStr);
  if (!start) return ["june"];
  const end = parse(endStr) || start;
  const day = today.getDay(); // 0 Sun..6 Sat
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - ((day + 6) % 7)); // Monday
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); // Sunday
  const weStart = new Date(weekStart); weStart.setDate(weekStart.getDate() + 5); // Saturday
  const junS = new Date(today.getFullYear(), 5, 1);
  const junE = new Date(today.getFullYear(), 5, 30);
  const overlaps = (a, b) => start <= b && a <= end;
  const when = [];
  if (start <= today && today <= end) when.push("today");
  if (overlaps(weStart, weekEnd)) when.push("weekend");
  if (overlaps(weekStart, weekEnd)) when.push("week");
  if (overlaps(junS, junE)) when.push("june");
  return when.length ? when : ["june"];
}

// One Supabase row -> the shape every component (EventCard, EventDetail,
// MapPanel, dedupeLanes filters) expects.
export function transformRecord(item) {
  return {
    id: item.slug || item.id,
    title: item.title || '',
    provider: item.provider_name || '',
    img: item.hero_image_url || 'placeholder',
    area: normArea(item.area),
    age: normAge(item.age_band),
    ageLabel: item.age_band ? (Array.isArray(item.age_band) ? item.age_band.join(', ') : item.age_band) : 'All ages',
    priceType: item.price_type || 'paid',
    price: item.price_display || '',
    priceDisplay: item.price_display || 'Free',
    priceInfo: {
      type: item.price_type || 'paid',
      display: item.price_display || '',
      note: item.price_notes || null,
    },
    when: deriveWhen(item.start_date, item.end_date),
    type: normType(item.type),
    festival: (item.type || '').toLowerCase() === 'festival',
    status: item.status || 'active',
    lat: item.latitude,
    lng: item.longitude,
    venue: item.venue_name || '',
    venueAddress: item.venue_address || '',
    description: item.description || item.long_description || '',
    longBlurb: item.long_description || item.description || '',
    blurb: item.description || '',
    dates: item.start_date ? `${item.start_date} - ${item.end_date || item.start_date}` : 'Ongoing',
    times: item.times || '',
    recurrence: item.recurrence || '',
    bookingRequired: item.booking_required || false,
    bookingUrl: item.booking_url || '',
    tags: item.categories ? (Array.isArray(item.categories) ? item.categories : [item.categories]) : [],
    media: [], // EventDetail expects a media array
    pin: null, // lat/lng used instead of a static pin
  };
}

// Fetch every publicly-visible listing, transformed to the app shape.
// Only ever exposes reviewed listings: review_status=approved AND
// status IN (active, expired) — expired stays in so the "Show expired"
// toggle keeps working; draft/needs_review/rejected/archived never reach
// the browser. Falls back to the static snapshot only if the fetch fails
// (network/Supabase outage), not as a routine data source.
export async function fetchLiveEvents() {
  try {
    const { data, error } = await supabase
      .from('things_to_do')
      .select('*')
      .eq('review_status', 'approved')
      .in('status', ['active', 'expired'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return FALLBACK_EVENTS;
    }
    return (data || []).map(transformRecord);
  } catch (err) {
    console.error('Failed to fetch events:', err);
    return FALLBACK_EVENTS;
  }
}
