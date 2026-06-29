'use client';

// ============================================================
// /admin/review — audit & review queue for Jungle Summer listings.
//
// Shows each listing with its eval report (accuracy / category-fit /
// marketplace-overlap flags) and lets a reviewer Approve (go live),
// Reject (hide), Expire, Restore, or edit fields inline. All mutations
// go through /api/admin/things/* which validate the admin secret
// server-side — the password below only gates the view.
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const GREEN = '#009B4D';
const INK = '#0C3C26';
const SECRET_KEY = 'admin_review_secret';

const TABS = [
  { key: 'needs_review', label: 'Needs review' },
  { key: 'approved', label: 'Live' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

const LEVEL_STYLE = {
  error: { bg: '#FEE2E2', fg: '#B91C1C', label: 'ERROR' },
  warn: { bg: '#FEF3C7', fg: '#92400E', label: 'WARN' },
  info: { bg: '#E5E7EB', fg: '#374151', label: 'info' },
};

const box = { background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' };
const btn = (bg, fg = '#fff') => ({
  padding: '8px 16px', background: bg, color: fg, border: 'none', borderRadius: 999,
  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
});

function ScoreDot({ score }) {
  const color = score >= 0.85 ? GREEN : score >= 0.6 ? '#D97706' : '#DC2626';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {score.toFixed(2)}
    </span>
  );
}

function Flag({ flag }) {
  const s = LEVEL_STYLE[flag.level] || LEVEL_STYLE.info;
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 13, marginTop: 4 }}>
      <span style={{ background: s.bg, color: s.fg, padding: '1px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
        {s.label}
      </span>
      <span style={{ color: '#444' }}>{flag.message}</span>
    </div>
  );
}

const EDIT_FIELDS = [
  ['title', 'Title'], ['slug', 'Slug'], ['provider_name', 'Provider'], ['type', 'Type'],
  ['price_type', 'Price type'], ['price_display', 'Price display'],
  ['start_date', 'Start date'], ['end_date', 'End date'], ['area', 'Area'],
  ['venue_name', 'Venue'], ['hero_image_url', 'Hero image URL'], ['visit_site_url', 'Visit URL'],
  ['description', 'Description'],
];

function RecordCard({ rec, secret, onChanged, selected, onToggleSelect }) {
  const [busy, setBusy] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  const act = async (action, fields) => {
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/things/${rec.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ action, fields }),
      });
      const json = await res.json();
      if (!res.ok) { alert(`Failed: ${json.error || res.status}`); return; }
      onChanged();
      if (action === 'update') setEditing(false);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  const ev = rec.eval || { score: 1, flags: [], categoryOk: true };
  const live = rec.review_status === 'approved' && rec.status === 'active';

  return (
    <div style={{ ...box, padding: 20, marginBottom: 16, border: ev.hasError ? '1px solid #FCA5A5' : '1px solid #EEE' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <input
          type="checkbox"
          checked={!!selected}
          onChange={() => onToggleSelect(rec.id)}
          title="Select for bulk action"
          style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: GREEN, flexShrink: 0 }}
        />
        {rec.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={rec.hero_image_url} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8, flexShrink: 0, background: '#F3F4F6' }} />
        ) : (
          <div style={{ width: 96, height: 96, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 11, flexShrink: 0 }}>no image</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 17, color: INK, fontWeight: 700 }}>{rec.title || '(untitled)'}</h3>
            <ScoreDot score={ev.score} />
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: live ? '#DCFCE7' : '#F3F4F6', color: live ? '#166534' : '#6B7280', fontWeight: 600 }}>
              {rec.review_status} / {rec.status}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            {[rec.provider_name, rec.type, rec.area, rec.price_display].filter(Boolean).join(' · ')}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            {rec.start_date ? `${rec.start_date} → ${rec.end_date || rec.start_date}` : 'No dates'}
            {rec.visit_site_url && <> · <a href={rec.visit_site_url} target="_blank" rel="noreferrer" style={{ color: GREEN }}>visit ↗</a></>}
          </div>

          {ev.flags.length > 0 && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: '#FAFAFA', borderRadius: 8 }}>
              {ev.flags.map((f, i) => <Flag key={i} flag={f} />)}
            </div>
          )}
          {ev.flags.length === 0 && (
            <div style={{ marginTop: 10, fontSize: 13, color: GREEN, fontWeight: 600 }}>✓ No flags — clean record</div>
          )}
        </div>
      </div>

      {editing && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #EEE', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {EDIT_FIELDS.map(([k, label]) => (
            <label key={k} style={{ fontSize: 12, color: '#374151', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {label}
              <input
                defaultValue={rec[k] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                style={{ padding: '6px 8px', border: '1px solid #DDD', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
              />
            </label>
          ))}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <button onClick={() => act('update', draft)} disabled={busy} style={btn(GREEN)}>Save changes</button>
            <button onClick={() => setEditing(false)} style={btn('#fff', '#374151')}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!live && <button onClick={() => act('approve')} disabled={busy} style={btn(GREEN)}>{busy === 'approve' ? '…' : '✓ Approve & publish'}</button>}
        {rec.review_status !== 'rejected' && <button onClick={() => act('reject')} disabled={busy} style={btn('#DC2626')}>{busy === 'reject' ? '…' : '✕ Reject'}</button>}
        {live && <button onClick={() => act('expire')} disabled={busy} style={btn('#D97706')}>Expire</button>}
        {(rec.review_status === 'rejected' || rec.status === 'archived' || rec.status === 'expired') && (
          <button onClick={() => act('restore')} disabled={busy} style={btn('#6B7280')}>Restore to queue</button>
        )}
        <button onClick={() => { setEditing((v) => !v); setDraft({}); }} style={btn('#fff', '#374151')}>{editing ? 'Close edit' : 'Edit'}</button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const [secret, setSecret] = useState('');
  const [input, setInput] = useState('');
  const [tab, setTab] = useState('needs_review');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const toggleSelect = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  useEffect(() => {
    const s = sessionStorage.getItem(SECRET_KEY);
    if (s) setSecret(s);
  }, []);

  const load = useCallback(async (sec, t) => {
    setLoading(true);
    setAuthError('');
    try {
      const qs = t === 'all' ? '' : `?review_status=${t}`;
      const res = await fetch(`/api/admin/things${qs}`, { headers: { 'x-admin-secret': sec } });
      if (res.status === 401) {
        setAuthError('Incorrect secret.');
        setSecret('');
        sessionStorage.removeItem(SECRET_KEY);
        return;
      }
      const json = await res.json();
      setData(json);
      setSelected(new Set()); // selection is stale after a reload
    } catch (e) {
      setAuthError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkAct = async (action) => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(`${action} ${ids.length} listing(s)?`)) return;
    setBulkBusy(true);
    try {
      const res = await fetch('/api/admin/things/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ action, ids }),
      });
      const json = await res.json();
      if (!res.ok) { alert(`Failed: ${json.error || res.status}`); return; }
      await load(secret, tab);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setBulkBusy(false);
    }
  };

  useEffect(() => { if (secret) load(secret, tab); }, [secret, tab, load]);

  if (!secret) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F0', fontFamily: 'Manrope, sans-serif' }}>
        <div style={{ ...box, padding: 40, width: '100%', maxWidth: 400, margin: 20 }}>
          <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 26, color: INK, textAlign: 'center', marginBottom: 8 }}>Review queue</h1>
          <p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>Enter the admin review secret.</p>
          <form onSubmit={(e) => { e.preventDefault(); sessionStorage.setItem(SECRET_KEY, input); setSecret(input); }}>
            <input type="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Secret" autoFocus
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #DDD', fontSize: 14, boxSizing: 'border-box', marginBottom: 16 }} />
            {authError && <div style={{ color: '#C00', fontSize: 13, marginBottom: 12 }}>{authError}</div>}
            <button type="submit" style={{ ...btn(GREEN), width: '100%', padding: 12, fontSize: 15 }}>Unlock</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/admin" style={{ color: GREEN, fontSize: 13 }}>← Excel uploader</Link>
          </div>
        </div>
      </div>
    );
  }

  const s = data?.summary;
  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F0', fontFamily: 'Manrope, sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #EEE', padding: '18px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 22, color: INK, margin: 0 }}>Summer · Review queue</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => load(secret, tab)} style={btn('#fff', '#374151')}>↻ Refresh</button>
            <button onClick={() => { sessionStorage.removeItem(SECRET_KEY); setSecret(''); }} style={btn('#fff', '#666')}>Lock</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={btn(tab === t.key ? INK : '#fff', tab === t.key ? '#fff' : '#374151')}>{t.label}</button>
          ))}
        </div>

        {s && (
          <div style={{ ...box, padding: 16, marginBottom: 16, display: 'flex', gap: 28, fontSize: 14, flexWrap: 'wrap' }}>
            <span><b>{s.total}</b> shown</span>
            <span style={{ color: '#B91C1C' }}><b>{s.with_errors}</b> with errors</span>
            <span style={{ color: '#92400E' }}><b>{s.off_category}</b> off-category / overlap</span>
            <span style={{ color: '#6B7280' }}>{s.needs_review} awaiting review</span>
          </div>
        )}

        {!loading && data?.records?.length > 0 && (() => {
          const recs = data.records;
          const cleanIds = recs.filter((r) => !r.eval?.hasError).map((r) => r.id);
          const allSelected = selected.size === recs.length && recs.length > 0;
          return (
            <div style={{ ...box, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', position: 'sticky', top: 8, zIndex: 5 }}>
              <button onClick={() => setSelected(allSelected ? new Set() : new Set(recs.map((r) => r.id)))} style={btn('#fff', '#374151')}>
                {allSelected ? 'Deselect all' : `Select all (${recs.length})`}
              </button>
              <button onClick={() => setSelected(new Set(cleanIds))} style={btn('#fff', '#374151')} title="Select records with no error-level flags">
                Select clean ({cleanIds.length})
              </button>
              <span style={{ fontSize: 14, color: '#374151', fontWeight: 700 }}>{selected.size} selected</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => bulkAct('approve')} disabled={!selected.size || bulkBusy} style={{ ...btn(GREEN), opacity: !selected.size || bulkBusy ? 0.5 : 1 }}>
                {bulkBusy ? '…' : `✓ Approve selected`}
              </button>
              <button onClick={() => bulkAct('reject')} disabled={!selected.size || bulkBusy} style={{ ...btn('#DC2626'), opacity: !selected.size || bulkBusy ? 0.5 : 1 }}>
                ✕ Reject selected
              </button>
            </div>
          );
        })()}

        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading…</div>}
        {!loading && data?.records?.length === 0 && <div style={{ ...box, padding: 40, textAlign: 'center', color: '#666' }}>Nothing here.</div>}
        {!loading && data?.records?.map((rec) => (
          <RecordCard key={rec.id} rec={rec} secret={secret} onChanged={() => load(secret, tab)}
            selected={selected.has(rec.id)} onToggleSelect={toggleSelect} />
        ))}
      </div>
    </div>
  );
}
