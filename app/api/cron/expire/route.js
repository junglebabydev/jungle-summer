import { getAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// GET /api/cron/expire
// Flips active listings whose end_date is in the past to status='expired',
// which removes them from the public site (RLS only exposes active+approved).
// Ongoing / null-end_date records are left untouched.
//
// Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`. We accept
// that, or the same secret as an x-cron-secret header for manual triggers.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') || '';
  const hdr = request.headers.get('x-cron-secret') || '';
  const ok = secret && (auth === `Bearer ${secret}` || hdr === secret);
  if (!ok) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('things_to_do')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .not('end_date', 'is', null)
    .lt('end_date', today)
    .select('id, slug, end_date');

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ expired: data?.length || 0, today, ids: (data || []).map((r) => r.slug || r.id) });
}
