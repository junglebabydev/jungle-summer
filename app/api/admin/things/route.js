import { getAdminClient, isAuthorized } from '@/lib/supabase-admin';
import { evaluateRecord } from '@/lib/eval.mjs';
import { MARKETPLACE_NAMES } from '@/lib/marketplace-names';

export const dynamic = 'force-dynamic';

// GET /api/admin/things?review_status=needs_review
// Returns records (service-role, RLS-bypassing) each with an inline eval
// report so the review page can show flags without a second round-trip.
export async function GET(request) {
  if (!isAuthorized(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reviewStatus = searchParams.get('review_status'); // optional filter

  const supabase = getAdminClient();
  let query = supabase.from('things_to_do').select('*').order('created_at', { ascending: false });
  if (reviewStatus) query = query.eq('review_status', reviewStatus);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const records = (data || []).map((r) => ({ ...r, eval: evaluateRecord(r, { marketplaceNames: MARKETPLACE_NAMES }) }));
  const summary = {
    total: records.length,
    needs_review: records.filter((r) => r.review_status === 'needs_review').length,
    with_errors: records.filter((r) => r.eval.hasError).length,
    off_category: records.filter((r) => !r.eval.categoryOk).length,
  };
  return Response.json({ summary, records });
}
