import { getAdminClient, isAuthorized } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// Columns the review page is allowed to edit inline. Anything else in the
// PATCH body is ignored, so a compromised client can't write arbitrary
// columns (e.g. confidence_score, created_at).
const EDITABLE = new Set([
  'title', 'slug', 'provider_name', 'provider_url', 'description', 'long_description',
  'type', 'categories', 'price_type', 'price_display', 'price_min', 'price_max',
  'age_min', 'age_max', 'age_band', 'area', 'venue_name', 'venue_address',
  'start_date', 'end_date', 'recurrence', 'booking_required', 'indoor_outdoor',
  'hero_image_url', 'image_urls', 'visit_site_url',
]);

// PATCH /api/admin/things/:id   body: { action, fields? }
//   action 'approve' → review_status=approved, status=active   (goes live)
//   action 'reject'  → review_status=rejected, status=archived (hidden)
//   action 'expire'  → status=expired                          (hidden)
//   action 'restore' → review_status=needs_review, status=draft
//   action 'update'  → patch whitelisted fields only
export async function PATCH(request, { params }) {
  if (!isAuthorized(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { action, fields } = body || {};

  let patch;
  switch (action) {
    case 'approve': patch = { review_status: 'approved', status: 'active' }; break;
    case 'reject':  patch = { review_status: 'rejected', status: 'archived' }; break;
    case 'expire':  patch = { status: 'expired' }; break;
    case 'restore': patch = { review_status: 'needs_review', status: 'draft' }; break;
    case 'update': {
      patch = {};
      for (const [k, v] of Object.entries(fields || {})) if (EDITABLE.has(k)) patch[k] = v;
      if (Object.keys(patch).length === 0) return Response.json({ error: 'No editable fields' }, { status: 400 });
      break;
    }
    default: return Response.json({ error: `Unknown action "${action}"` }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase.from('things_to_do').update(patch).eq('id', id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ record: data });
}
