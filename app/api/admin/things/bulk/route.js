import { getAdminClient, isAuthorized } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// POST /api/admin/things/bulk   body: { action, ids: [uuid, ...] }
// Applies one review action to many records at once (bulk approve/reject/etc).
// Same status transitions as the single-record PATCH route.
const PATCHES = {
  approve: { review_status: 'approved', status: 'active' },
  reject: { review_status: 'rejected', status: 'archived' },
  expire: { status: 'expired' },
  restore: { review_status: 'needs_review', status: 'draft' },
};

export async function POST(request) {
  if (!isAuthorized(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { action, ids } = body || {};

  const patch = PATCHES[action];
  if (!patch) return Response.json({ error: `Unknown action "${action}"` }, { status: 400 });
  if (!Array.isArray(ids) || ids.length === 0) return Response.json({ error: 'No ids provided' }, { status: 400 });
  if (ids.length > 500) return Response.json({ error: 'Too many ids (max 500)' }, { status: 400 });

  const supabase = getAdminClient();
  const { data, error } = await supabase.from('things_to_do').update(patch).in('id', ids).select('id');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ updated: data?.length || 0 });
}
