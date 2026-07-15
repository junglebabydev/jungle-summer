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

// Age band -> human display label, e.g. ['4-6','all_ages'] -> "4–6, All Ages".
const AGE_LABELS = { "0-3": "0–3", "4-6": "4–6", "7-12": "7–12", all_ages: "All Ages", all: "All Ages" };
export const ageLabelFor = (bands) => {
  const arr = Array.isArray(bands) ? bands : bands ? [bands] : null;
  if (!arr || !arr.length) return "All Ages";
  return arr.map((b) => AGE_LABELS[b] || b).join(", ");
};

// "indoor" -> "Indoor", "north-east" stays untouched (area has its own map).
const INDOOR_OUTDOOR_LABELS = { indoor: "Indoor", outdoor: "Outdoor", both: "Indoor & Outdoor" };
export const indoorOutdoorLabelFor = (v) => INDOOR_OUTDOOR_LABELS[(v || "").toLowerCase()] || "";

// "2026-07-12" -> "12 Jul 26". Falls through to the raw string if unparseable
// rather than hiding the date entirely.
function formatDate(s) {
  const d = new Date(`${s}T00:00:00`);
  if (isNaN(d.getTime())) return s;
  const day = d.getDate();
  const month = d.toLocaleString('en-GB', { month: 'short' });
  const year = String(d.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}
export function dateRangeFor(startStr, endStr) {
  if (!startStr) return 'Ongoing';
  if (!endStr || endStr === startStr) return formatDate(startStr);
  return `${formatDate(startStr)} to ${formatDate(endStr)}`;
}

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
    ageLabel: ageLabelFor(item.age_band),
    indoorOutdoor: indoorOutdoorLabelFor(item.indoor_outdoor),
    priceType: item.price_type || 'paid',
    price: item.price_display || '',
    priceDisplay: item.price_display || 'Free',
    // No `priceInfo` here on purpose — EventCard's priceInfoFor() derives a
    // short "From $X" display from priceType/priceDisplay on the fly (with
    // an asterisk when multiple prices/conditions are detected). Pre-setting
    // priceInfo.display to the raw price_display text short-circuits that and
    // was why long price strings ("$15 (adult) | $10 (child 3-12) | Free
    // (below 3)") were bleeding out of the card instead of showing "From $10*".
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
    dates: dateRangeFor(item.start_date, item.end_date),
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
