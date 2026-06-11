// ============================================================
// EventDetail — image grid + content + sticky sidebar
// A "thing to do" detail page (PRD §5). No booking, no ratings.
// ============================================================
import React from 'react';
import { EVENTS, IMG, IMG_FALLBACK, priceInfoFor } from './data.jsx';
import { Ico, Button, MetaPill } from './Primitives.jsx';

export function EventDetail({ go, event, onShare }) {
  const e = event || EVENTS[0];
  const pi = priceInfoFor(e);
  const isFree   = pi.type === 'free';
  const isMixed  = pi.type === 'mixed';
  const isPaid   = pi.type === 'paid';
  const expired = e.status === 'expired';
  const [copied, setCopied] = React.useState(false);
  const [imgFailed, setImgFailed] = React.useState(false);
  // "All ages" reads oddly with a "y.o" suffix; only append it for real age ranges.
  const isAllAges = (e.age && e.age.includes('all')) || /all ages/i.test(e.ageLabel || '');
  const ageText = isAllAges ? e.ageLabel : `${e.ageLabel} y.o`;
  const hasImg = !!e.img && !imgFailed;
  const imgSrc = hasImg ? IMG(e.img) : IMG_FALLBACK;

  // outbound visit-site URL — the provider's real listing page
  const visitUrl = e.visitSiteUrl;

  // "When" facts straight from the things_to_do record
  const when = [
  { icon: Ico.cal(20), label: 'Dates', value: e.dates },
  { icon: Ico.clock(20), label: 'Times', value: e.times },
  { icon: Ico.repeat(20), label: 'Runs', value: e.recurrence },
  { icon: Ico.ticket(20), label: 'Booking', value: e.bookingRequired ? 'Booking required' : 'Drop in, no booking needed' }].
  filter((r) => r.value);

  function copyLink() {try {navigator.clipboard && navigator.clipboard.writeText(`https://summer.jungle.baby/${e.id}`);} catch (x) {}setCopied(true);setTimeout(() => setCopied(false), 1600);}

  return (
    <div data-screen-label="03 Thing to do detail" style={{ background: '#fff', fontFamily: 'Manrope, sans-serif' }}>
      <div style={{ maxWidth: 1256, margin: '0 auto', padding: '20px clamp(20px,4vw,48px) 80px' }}>
        {/* breadcrumb */}
        <div style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>
          <a href="#" onClick={(x) => {x.preventDefault();go('landing');}} style={crumb}>Summer in SG</a> · <a href="#" onClick={(x) => {x.preventDefault();go('browse');}} style={crumb}>Things to do</a> · <span>{e.title}</span>
        </div>

        {/* expired banner */}
        {expired &&
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: '#F4F4F0', border: '1px solid #E2E2DC', borderRadius: 14, padding: '14px 18px', marginBottom: 18 }}>
            <span style={{ background: '#444', color: '#fff', fontSize: 12, fontWeight: 800, padding: '5px 11px', borderRadius: 9999, whiteSpace: 'nowrap' }}>Expired</span>
            <span style={{ fontSize: 14.5, color: '#444', fontWeight: 600, flex: 1, minWidth: 200 }}>This thing to do has ended. Browse what's on now.</span>
            <Button size="sm" variant="outline" onClick={() => go('browse')}>See what's on</Button>
          </div>
        }

        {/* main content grid with sticky sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(300px, 1fr)', gap: 40, alignItems: 'start' }}>
          {/* left column - image and content */}
          <div>
            {/* hero image — single image from the record, or Jungle logo fallback */}
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginBottom: 24, aspectRatio: '16 / 9', maxHeight: 460, background: hasImg ? '#F5F5F0' : '#E5F5ED', filter: expired ? 'grayscale(0.85)' : 'none', opacity: expired ? 0.8 : 1 }}>
              <img
                src={imgSrc}
                alt={e.title}
                onError={() => setImgFailed(true)}
                style={{ width: '100%', height: '100%', objectFit: hasImg ? 'cover' : 'contain', objectPosition: 'center', display: 'block', padding: hasImg ? 0 : '8% 20%' }}
              />
              <button onClick={() => go('browse')} style={{ position: 'absolute', top: 16, left: 16, display: 'inline-flex', alignItems: 'center', gap: 7, height: 42, padding: '0 16px', borderRadius: 9999, background: 'rgba(255,255,255,.95)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, color: '#0C3C26', boxShadow: '0 2px 8px rgba(0,0,0,.15)' }}>
                {Ico.arrowL(18)} Back
              </button>
            </div>

            {/* content starts here */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ background: isFree ? '#EEC71B' : '#E5F5ED', color: isFree ? '#3a2e00' : '#0C3C26', fontSize: 12.5, fontWeight: 800, padding: '6px 12px', borderRadius: 9999 }}>{isFree ? 'Free' : e.type}</span>
              {e.festival && !expired && <span style={{ background: '#0C3C26', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 9999 }}>Festival on now</span>}
            </div>
            <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 'clamp(28px,4vw,40px)', color: '#0C3C26', margin: '0 0 6px', lineHeight: 1.08 }}>{e.title}</h1>
            <div style={{ fontSize: 15.5, color: '#666', marginBottom: 14 }}>by <span style={{ color: '#009B4D', fontWeight: 700 }}>{e.provider}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26, paddingBottom: 24, borderBottom: '1px solid #F1F1F1' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14.5, color: '#444', fontWeight: 600 }}><span style={{ color: '#009B4D' }}>{Ico.pin(16)}</span>{e.venue}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {e.area && <MetaPill><span style={{ color: '#009B4D' }}>{Ico.pin(11)}</span>{e.area}</MetaPill>}
                {e.ageLabel && <MetaPill>{ageText}</MetaPill>}
                {e.indoorOutdoor && <MetaPill>{e.indoorOutdoor}</MetaPill>}
              </div>
            </div>

            <h2 style={blockH}>About</h2>
            <p style={{ fontSize: 16, color: '#333', lineHeight: 1.65, margin: '0 0 18px', maxWidth: 640 }}>{e.longBlurb || e.blurb}</p>

            {e.promo && !expired &&
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#FFF8E1', border: '1px dashed #EEC71B', borderRadius: 12, padding: '10px 14px', marginBottom: 24 }}>
                <span style={{ background: '#EEC71B', color: '#3a2e00', fontWeight: 800, fontSize: 13, padding: '4px 10px', borderRadius: 8 }}>{e.promo}</span>
                <span style={{ fontSize: 13.5, color: '#7a6a1e', fontWeight: 600 }}>Mention this code at the door for a treat.</span>
              </div>
            }

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 34 }}>
              {e.tags.map((t) => <MetaPill key={t} tone="green">{t}</MetaPill>)}
            </div>

            <h2 style={blockH}>When</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 10, maxWidth: 560, marginBottom: 32 }}>
              {when.map((r, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: '1px solid #EEE', borderRadius: 14, background: '#fff' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 10, background: '#E5F5ED', color: '#009B4D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, color: '#858585', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{r.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#181818' }}>{r.value}</div>
                  </div>
                </div>
              )}
            </div>

            <h2 style={blockH}>Where</h2>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 15, color: '#333', lineHeight: 1.5, maxWidth: 560, marginBottom: 40 }}>
              <span style={{ color: '#009B4D', marginTop: 1 }}>{Ico.pin(18)}</span>
              <div>
                <div style={{ fontWeight: 700, color: '#181818' }}>{e.venue}</div>
                <div style={{ color: '#666' }}>{e.venueAddress} · {e.area} Singapore</div>
              </div>
            </div>
          </div>

          {/* right sidebar - sticky */}
          <aside style={{ position: 'sticky', top: 80, alignSelf: 'start', border: '1px solid #EAEAEA', borderRadius: 20, padding: 24, background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,.06)' }} data-comment-anchor="47cfc22db8-aside-95-11">
            {/* ── Pricing block ── */}
            <div style={{ marginBottom: 20 }}>
              {isFree && !expired && (
                <div style={{ fontFamily: '"Feather Bold", serif', fontSize: 36, color: '#009B4D', lineHeight: 1, marginBottom: 4 }}>Free</div>
              )}
              {isPaid && !expired && (
                <div style={{ fontFamily: '"Feather Bold", serif', fontSize: 36, color: '#0C3C26', lineHeight: 1, marginBottom: 4 }}>{pi.display}</div>
              )}
              {isMixed && !expired && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: '#E5F5ED', borderRadius: 12 }}>
                    <span style={{ fontFamily: '"Feather Bold", serif', fontSize: 24, color: '#009B4D', lineHeight: 1, flexShrink: 0 }}>Free</span>
                    <span style={{ fontSize: 13.5, color: '#2a6040', fontWeight: 600, lineHeight: 1.35 }}>for {pi.freeFor}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: '#F7F7F5', borderRadius: 12 }}>
                    <span style={{ fontFamily: '"Feather Bold", serif', fontSize: 22, color: '#0C3C26', lineHeight: 1, flexShrink: 0 }}>{pi.paidDisplay}</span>
                    <span style={{ fontSize: 13.5, color: '#666', fontWeight: 500, lineHeight: 1.35 }}>for others{pi.note ? ` · ${pi.note}` : ''}</span>
                  </div>
                </div>
              )}
              {expired && (
                <div style={{ fontFamily: '"Feather Bold", serif', fontSize: 28, color: '#bbb', lineHeight: 1, marginBottom: 4 }}>Ended</div>
              )}
              {pi.fullText && (isPaid || isMixed) && !expired && pi.fullText !== pi.display && (
                <div style={{ fontSize: 12.5, color: '#858585', marginTop: 8, lineHeight: 1.45 }}>{pi.fullText}</div>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#858585', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              {Ico.globe(15)} Listed from {e.source}
            </div>

            {expired ?
            <Button style={{ width: '100%' }} size="lg" variant="outline" onClick={() => go('browse')}>
                See what's on now
              </Button> :

            <Button style={{ width: '100%' }} size="lg" onClick={() => visitUrl && window.open(visitUrl, '_blank', 'noopener,noreferrer')}>
                {Ico.external(18)} Visit site
              </Button>
            }
            <Button variant="outline" style={{ width: '100%', marginTop: 10 }} onClick={() => onShare(e)}>
              {Ico.share(18)} Send to me
            </Button>
            <button onClick={copyLink} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: copied ? '#009B4D' : '#0C3C26', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              {copied ? <>{Ico.check(16)} Link copied</> : <>{Ico.link(16)} Copy link</>}
            </button>

            <div style={{ borderTop: '1px solid #F1F1F1', marginTop: 20, paddingTop: 18 }}>
              <div style={{ fontSize: 13, color: '#858585', lineHeight: 1.5 }}>Prices and times are set by the provider and can change. Always check before you go.</div>
            </div>
          </aside>
        </div>

      </div>
    </div>);

}

const crumb = { color: '#009B4D', textDecoration: 'none', fontWeight: 600 };
const blockH = { fontFamily: '"Feather Bold", serif', fontSize: 22, color: '#0C3C26', margin: '0 0 14px' };

