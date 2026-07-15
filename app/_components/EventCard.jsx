// ============================================================
// EventCard — marketplace card for browse rows + grid
// Supports priceInfo.type: 'free' | 'paid' | 'mixed'
// ============================================================
import React from 'react';
import { IMG, IMG_FALLBACK, priceInfoFor } from './data.jsx';
import { Ico, MetaPill } from './Primitives.jsx';

export function EventCard({e, onOpen, onShare, wide=false}) {
  const pi = priceInfoFor(e);

  const isFree   = pi.type === 'free';
  const isMixed  = pi.type === 'mixed';
  const expired  = e.status === 'expired';

  const [imgFailed, setImgFailed] = React.useState(false);
  const hasImg = !!e.img && !imgFailed;

  // Image badge: only for fully-free or expired
  const badge = expired
    ? { bg: '#555',    fg: '#fff',    text: 'Ended' }
    : isFree
    ? { bg: '#EEC71B', fg: '#3a2e00', text: 'Free' }
    : null;

  return (
    <div
      onClick={onOpen}
      style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,.06)', cursor: 'pointer',
        fontFamily: 'Manrope, sans-serif', transition: 'box-shadow 200ms ease',
        border: '1px solid #EBEBEB', display: 'flex', flexDirection: 'column',
        height: '100%', opacity: expired ? 0.58 : 1
      }}
      onMouseEnter={ev => ev.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.11)'}
      onMouseLeave={ev => ev.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'}
    >
      {/* ── Image (real photo, or Jungle logo fallback) ── */}
      <div style={{
        position: 'relative',
        aspectRatio: '3/2',
        background: hasImg ? '#F5F5F0' : '#E5F5ED',
        filter: expired ? 'grayscale(0.85)' : 'none'
      }}>
        <img
          src={hasImg ? IMG(e.img) : IMG_FALLBACK}
          alt={e.title}
          onError={() => setImgFailed(true)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: hasImg ? 'cover' : 'contain',
            objectPosition: 'center', padding: hasImg ? 0 : '14% 22%'
          }}
        />
        {/* Bottom gradient for depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.18) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Share button */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <button
            title="Share"
            onClick={ev => { ev.stopPropagation(); onShare(e); }}
            style={ecIconBtn}
          >
            <span style={{ color: '#181818' }}>{Ico.share(16)}</span>
          </button>
        </div>

        {/* Badge */}
        {badge && (
          <div style={{
            position: 'absolute', top: 11, left: 11,
            background: badge.bg, color: badge.fg,
            fontSize: 11, fontWeight: 800, padding: '4px 10px',
            borderRadius: 9999, letterSpacing: '.04em',
            boxShadow: '0 2px 6px rgba(0,0,0,.15)'
          }}>{badge.text}</div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '13px 15px 15px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Title */}
        <div style={{
          fontSize: 15, fontWeight: 700, color: '#111',
          lineHeight: 1.3, marginBottom: 3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{e.title}</div>

        {/* Provider */}
        <div style={{
          fontSize: 12.5, color: '#009B4D', fontWeight: 600,
          marginBottom: 6
        }}>{e.provider}</div>

        {/* Dates */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 600,
          color: expired ? '#aaa' : '#2a6040',
          marginBottom: 8
        }}>
          <span style={{ color: expired ? '#ccc' : '#009B4D', display: 'inline-flex' }}>{Ico.cal(12)}</span>
          {e.dates}
        </div>

        {/* Blurb — 1-line */}
        <div style={{
          fontSize: 12.5, color: '#777', lineHeight: 1.45,
          marginBottom: 10,
          display: '-webkit-box', WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{e.blurb}</div>

        {/* Meta pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 'auto', marginBottom: 11 }}>
          {e.area && <MetaPill><span style={{ color: '#009B4D' }}>{Ico.pin(11)}</span>{e.area}</MetaPill>}
          {e.ageLabel && <MetaPill>{e.ageLabel}</MetaPill>}
          {e.indoorOutdoor && <MetaPill>{e.indoorOutdoor}</MetaPill>}
        </div>

        {/* ── Pricing + CTA ── */}
        <div style={{
          borderTop: '1px solid #F0F0F0', paddingTop: 11,
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', gap: 8
        }}>

          {/* Price — always one line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>

            {/* Fully free */}
            {isFree && !expired && (
              <span style={{ fontWeight: 800, color: '#009B4D', fontSize: 14.5 }}>Free</span>
            )}

            {/* Paid */}
            {pi.type === 'paid' && !expired && (
              <span style={{
                fontWeight: 800, color: '#111', fontSize: 14.5,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {pi.display}
              </span>
            )}

            {/* Mixed — [Free] · From S$X on one line */}
            {isMixed && !expired && (
              <>
                <span style={{
                  background: '#E5F5ED', color: '#007A3D',
                  fontWeight: 700, fontSize: 11.5, padding: '3px 9px',
                  borderRadius: 9999, flexShrink: 0
                }}>Free</span>
                <span style={{ color: '#aaa', fontSize: 13 }}>·</span>
                <span style={{
                  fontWeight: 700, color: '#111', fontSize: 14,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {pi.paidDisplay}
                </span>
              </>
            )}

            {/* Expired */}
            {expired && (
              <span style={{ fontWeight: 500, color: '#bbb', fontSize: 13 }}>Run ended</span>
            )}
          </div>

          {/* View details */}
          <span style={{
            fontSize: 12.5, fontWeight: 700, color: '#009B4D',
            display: 'inline-flex', alignItems: 'center', gap: 2,
            flexShrink: 0, whiteSpace: 'nowrap'
          }}>
            Details {Ico.chev(13)}
          </span>
        </div>

      </div>
    </div>
  );
}

const ecIconBtn = {
  width: 32, height: 32, borderRadius: 9999,
  background: 'rgba(255,255,255,.92)', border: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', boxShadow: '0 1px 5px rgba(0,0,0,.14)', padding: 0
};

