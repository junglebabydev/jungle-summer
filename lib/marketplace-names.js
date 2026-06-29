// Re-export of the cached marketplace name list so route handlers can
// import a stable module path. The JSON snapshot is produced by
// scripts/sync-marketplace.mjs. (Next.js/webpack imports JSON natively.)
import data from './marketplace-names.json';
export const MARKETPLACE_NAMES = data.names || [];
export const MARKETPLACE_META = { source: data.source, generated_at: data.generated_at, count: data.count };
