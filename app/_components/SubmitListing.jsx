// ============================================================
// SubmitListing — "List with Jungle" submission form
// Lets providers (or helpful parents) submit a thing to do for
// review. Fields map to the things_to_do schema (PRD §6).
// No backend: submit shows a confirmation state.
// ============================================================
import React from 'react';
import { Ico, Button, Chip, MetaPill } from './Primitives.jsx';
import { FILTERS } from './data.jsx';
import { DEAL_CATEGORIES } from './dealsData.jsx';

// ---- small field primitives (scoped to this file) ----
function Field({ label, hint, required, children, full }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7, gridColumn: full ? '1 / -1' : 'auto' }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#0C3C26' }}>
        {label}{required && <span style={{ color: '#009B4D' }}> *</span>}
      </span>
      {children}
      {hint && <span style={{ fontSize: 12.5, color: '#858585', lineHeight: 1.45 }}>{hint}</span>}
    </label>
  );
}

const fieldBase = {
  width: '100%', padding: '0 15px', height: 50, borderRadius: 12,
  border: '1px solid #DDDDDD', background: '#fff', fontFamily: 'Manrope, sans-serif',
  fontSize: 15.5, color: '#181818', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 150ms ease, box-shadow 150ms ease'
};

function TextInput({ value, onChange, placeholder, type = 'text', invalid }) {
  const [foc, setFoc] = React.useState(false);
  const border = invalid ? '#F63F3C' : foc ? '#009B4D' : '#DDDDDD';
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ ...fieldBase, borderColor: border, boxShadow: foc && !invalid ? '0 0 0 3px rgba(0,155,77,.12)' : 'none' }} />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4, invalid }) {
  const [foc, setFoc] = React.useState(false);
  const border = invalid ? '#F63F3C' : foc ? '#009B4D' : '#DDDDDD';
  return (
    <textarea value={value} placeholder={placeholder} rows={rows}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ ...fieldBase, height: 'auto', padding: '13px 15px', lineHeight: 1.55, resize: 'vertical', borderColor: border, boxShadow: foc && !invalid ? '0 0 0 3px rgba(0,155,77,.12)' : 'none' }} />
  );
}

// chip select — single value
function ChipSelect({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
      {options.map((o) => (
        <Chip key={o.k} active={value === o.k} onClick={() => onChange(value === o.k ? null : o.k)}>{o.label}</Chip>
      ))}
    </div>
  );
}

// chip select — multiple values
function ChipMulti({ options, values, onChange }) {
  const toggle = (k) => onChange(values.includes(k) ? values.filter((x) => x !== k) : [...values, k]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
      {options.map((o) => (
        <Chip key={o.k} active={values.includes(o.k)} onClick={() => toggle(o.k)}>{o.label}</Chip>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
      <span style={{ position: 'relative', width: 46, height: 27, borderRadius: 9999, background: value ? '#009B4D' : '#CFCFC8', transition: 'background 160ms', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 3, left: value ? 22 : 3, width: 21, height: 21, borderRadius: 9999, background: '#fff', transition: 'left 160ms', boxShadow: '0 1px 3px rgba(0,0,0,.28)' }} />
      </span>
      <span style={{ fontSize: 15, fontWeight: 600, color: '#333' }}>{label}</span>
    </button>
  );
}

function SectionCard({ n, title, sub, children }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #EEE', borderRadius: 18, padding: 'clamp(20px,3vw,28px)', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 22 }}>
        <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: '#E5F5ED', color: '#009B4D', fontWeight: 800, fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, sans-serif' }}>{n}</span>
        <div>
          <h2 style={{ fontFamily: '"Feather Bold", serif', fontSize: 22, color: '#0C3C26', margin: '2px 0 2px', lineHeight: 1.15 }}>{title}</h2>
          {sub && <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.5 }}>{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 };

// date input (native, Jungle-styled)
function DateInput({ value, onChange, invalid, min }) {
  const [foc, setFoc] = React.useState(false);
  const border = invalid ? '#F63F3C' : foc ? '#009B4D' : '#DDDDDD';
  return (
    <input type="date" value={value} min={min}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
      style={{ ...fieldBase, borderColor: border, color: value ? '#181818' : '#9a9a92', boxShadow: foc && !invalid ? '0 0 0 3px rgba(0,155,77,.12)' : 'none' }} />
  );
}

// segmented "who is submitting"
function RadioRow({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = value === o.k;
        return (
          <button key={o.k} type="button" onClick={() => onChange(o.k)}
            style={{ flex: '1 1 160px', textAlign: 'left', padding: '14px 16px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
              border: '2px solid ' + (active ? '#009B4D' : '#E5E4DD'), background: active ? '#E5F5ED' : '#fff' }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0C3C26' }}>{o.label}</div>
            {o.sub && <div style={{ fontSize: 12.5, color: '#777', marginTop: 2 }}>{o.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Listing-type taxonomy
// ============================================================
const LISTING_TYPES = [
  { k: 'activity', label: 'Activity, class or camp', sub: 'Classes, camps, birthdays, enrichment', icon: (s) => Ico.ticket(s) },
  { k: 'summer',   label: 'Summer thing to do',      sub: 'One-off or seasonal holiday activities', icon: (s) => Ico.sun(s) },
  { k: 'deal',     label: 'Deal or promo',           sub: 'A discount or offer for families',       icon: (s) => Ico.ticket(s) },
];

const HERO_COPY = {
  activity: { crumb: 'List with Jungle', h1: 'List your activity on Jungle', p: 'Run classes, camps or birthday parties for kids? Tell us about it. We review every submission and add the good ones to the marketplace. It is free to list.' },
  summer:   { crumb: 'List with Jungle', h1: 'Add a summer thing to do', p: 'Got a one-off or seasonal activity this holiday? Share the details and we will add the good ones to Things to do. It is free to list.' },
  deal:     { crumb: 'List with Jungle', h1: 'Submit a deal for families', p: 'Share a discount or promo for a kids\u2019 experience. Merchants and parents can both post. We review every deal before it goes live.' },
};

// ============================================================
// Type chooser (segmented cards)
// ============================================================
function TypeChooser({ value, onChange }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EEE', borderRadius: 18, padding: 'clamp(18px,2.5vw,24px)', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0C3C26', marginBottom: 14 }}>What would you like to submit?</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {LISTING_TYPES.map((t) => {
          const active = value === t.k;
          return (
            <button key={t.k} type="button" onClick={() => onChange(t.k)}
              style={{ textAlign: 'left', padding: '18px 18px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms',
                border: '2px solid ' + (active ? '#009B4D' : '#E5E4DD'), background: active ? '#E5F5ED' : '#fff' }}>
              <span style={{ display: 'inline-flex', width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                background: active ? '#009B4D' : '#F2F1EC', color: active ? '#fff' : '#7a7a72' }}>{t.icon(20)}</span>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: '#0C3C26', marginBottom: 3 }}>{t.label}</div>
              <div style={{ fontSize: 12.5, color: '#777', lineHeight: 1.4 }}>{t.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Main component
// ============================================================
export function SubmitListing({ go, initialType }) {
  const [listingType, setListingType] = React.useState(initialType || 'activity');
  React.useEffect(() => { if (initialType) setListingType(initialType); }, [initialType]);

  const blankExp = {
    title: '', provider: '', type: null, blurb: '',
    ages: [], indoorOutdoor: null,
    dates: '', times: '', recurrence: '', bookingRequired: false,
    area: null, venue: '', venueAddress: '',
    priceType: 'free', priceDisplay: '',
    website: '', photoUrl: '',
    contactName: '', contactEmail: '', agree: false
  };
  const blankDeal = {
    merchant: '', category: null, headline: '', detail: '',
    discountLabel: '', promo: '', expiry: '', redeem: '',
    area: null, location: '',
    submitterType: 'merchant', contactName: '', contactEmail: '', agree: false
  };
  const [f, setF] = React.useState(blankExp);
  const [d, setD] = React.useState(blankDeal);
  const [submitted, setSubmitted] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const setDeal = (k, v) => setD((s) => ({ ...s, [k]: v }));

  const isDeal = listingType === 'deal';

  // reset transient validation when switching type
  const switchType = (k) => { setListingType(k); setShowErrors(false); };

  const expEmailOk = /\S+@\S+\.\S+/.test(f.contactEmail);
  const dealEmailOk = /\S+@\S+\.\S+/.test(d.contactEmail);
  const expErrors = { title: !f.title.trim(), provider: !f.provider.trim(), blurb: !f.blurb.trim(), contactEmail: !expEmailOk, agree: !f.agree };
  const dealErrors = { merchant: !d.merchant.trim(), headline: !d.headline.trim(), discountLabel: !d.discountLabel.trim(), expiry: !d.expiry, contactEmail: !dealEmailOk, agree: !d.agree };
  const errors = isDeal ? dealErrors : expErrors;
  const hasErrors = Object.values(errors).some(Boolean);

  const submit = () => {
    if (hasErrors) { setShowErrors(true); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const resetAll = () => { setF(blankExp); setD(blankDeal); setSubmitted(false); setShowErrors(false); };

  const hero = HERO_COPY[listingType] || HERO_COPY.activity;

  // ---- success state ----
  if (submitted) {
    const name = isDeal ? (d.headline || 'your deal') : (f.title || 'your activity');
    const email = isDeal ? d.contactEmail : f.contactEmail;
    return (
      <div data-screen-label="Submit listing — done" style={{ background: '#F5F5F0', minHeight: '70vh', fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 20px' }}>
        <div style={{ background: '#fff', border: '1px solid #EEE', borderRadius: 22, boxShadow: '0 12px 32px rgba(0,0,0,.10)', maxWidth: 560, width: '100%', padding: 'clamp(28px,5vw,44px)', textAlign: 'center' }}>
          <span style={{ width: 66, height: 66, borderRadius: 9999, background: '#E5F5ED', color: '#009B4D', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{Ico.check(34)}</span>
          <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 30, color: '#0C3C26', margin: '0 0 10px', lineHeight: 1.12 }}>{isDeal ? 'Thanks, deal received' : 'Thanks, listing received'}</h1>
          <p style={{ fontSize: 16, color: '#555', lineHeight: 1.6, margin: '0 0 8px' }}>
            We have got <strong style={{ color: '#0C3C26' }}>{name}</strong> in the queue. Our team checks every submission, so give us a few days. We will email <strong style={{ color: '#0C3C26' }}>{email}</strong> once it is live.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 26 }}>
            <Button onClick={() => go(isDeal ? 'deals' : 'browse')}>{isDeal ? 'Browse deals' : 'Browse things to do'}</Button>
            <Button variant="outline" onClick={resetAll}>Submit another</Button>
          </div>
        </div>
      </div>
    );
  }

  // ---- form ----
  return (
    <div data-screen-label="Submit listing" style={{ background: '#F5F5F0', fontFamily: 'Manrope, sans-serif' }}>
      {/* head band */}
      <div style={{ background: '#0C3C26', color: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px clamp(20px,4vw,40px) 44px' }}>
          <div style={{ fontSize: 13, marginBottom: 12, opacity: .8 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); go('landing'); }} style={{ color: '#9FE3BD', textDecoration: 'none', fontWeight: 600 }}>Summer in SG</a>
            <span> · {hero.crumb}</span>
          </div>
          <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 'clamp(30px,4.4vw,44px)', margin: '0 0 10px', lineHeight: 1.06, maxWidth: 720 }}>{hero.h1}</h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, opacity: .9, margin: 0, maxWidth: 560 }}>{hero.p}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(24px,4vw,40px) clamp(20px,4vw,40px) 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(260px,1fr)', gap: 30, alignItems: 'start' }} className="submit-grid">

          {/* form column */}
          <div>
            <TypeChooser value={listingType} onChange={switchType} />

            {showErrors && hasErrors &&
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FDEAEA', border: '1px solid #F6C6C5', color: '#A4322F', borderRadius: 14, padding: '13px 16px', marginBottom: 20, fontSize: 14.5, fontWeight: 600 }}>
                <span style={{ flexShrink: 0 }}>{Ico.x(18)}</span>
                Please fill in the highlighted fields before submitting.
              </div>
            }

            {!isDeal && <React.Fragment>
            <SectionCard n="1" title="About the activity" sub="The basics parents will see first.">
              <div style={{ display: 'grid', gap: 18 }}>
                <Field label="Activity name" required>
                  <TextInput value={f.title} onChange={(v) => set('title', v)} placeholder="e.g. Holiday Storytime & Craft" invalid={showErrors && errors.title} />
                </Field>
                <Field label="Provider or organisation" required>
                  <TextInput value={f.provider} onChange={(v) => set('provider', v)} placeholder="e.g. National Library Board" invalid={showErrors && errors.provider} />
                </Field>
                <Field label="Category">
                  <ChipSelect options={FILTERS.type} value={f.type} onChange={(v) => set('type', v)} />
                </Field>
                <Field label="Short description" required hint="One or two sentences. What is it, and why will kids love it?">
                  <TextArea value={f.blurb} onChange={(v) => set('blurb', v)} placeholder="Free drop-in story sessions and a simple take-home craft at libraries across the island." invalid={showErrors && errors.blurb} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n="2" title="Who it is for" sub="Help us match it to the right families.">
              <div style={{ display: 'grid', gap: 18 }}>
                <Field label="Age groups" hint="Pick all that apply.">
                  <ChipMulti options={FILTERS.age} values={f.ages} onChange={(v) => set('ages', v)} />
                </Field>
                <Field label="Indoor or outdoor">
                  <ChipSelect options={[{ k: 'Indoor', label: 'Indoor' }, { k: 'Outdoor', label: 'Outdoor' }, { k: 'Both', label: 'Both' }]} value={f.indoorOutdoor} onChange={(v) => set('indoorOutdoor', v)} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n="3" title="When it runs" sub="So parents know if they can make it.">
              <div style={grid2}>
                <Field label="Dates" hint='e.g. "7–8 Jun" or "Open year-round"'>
                  <TextInput value={f.dates} onChange={(v) => set('dates', v)} placeholder="7–8 Jun" />
                </Field>
                <Field label="Times">
                  <TextInput value={f.times} onChange={(v) => set('times', v)} placeholder="10:00am – 6:00pm" />
                </Field>
                <Field label="How often" hint='e.g. "Daily", "Weekends", "Selected dates"'>
                  <TextInput value={f.recurrence} onChange={(v) => set('recurrence', v)} placeholder="Daily" />
                </Field>
                <Field label="Booking">
                  <div style={{ height: 50, display: 'flex', alignItems: 'center' }}>
                    <Toggle value={f.bookingRequired} onChange={(v) => set('bookingRequired', v)} label="Booking required" />
                  </div>
                </Field>
              </div>
            </SectionCard>

            <SectionCard n="4" title="Where to find it" sub="The venue and which part of the island.">
              <div style={{ display: 'grid', gap: 18 }}>
                <Field label="Area">
                  <ChipSelect options={FILTERS.area} value={f.area} onChange={(v) => set('area', v)} />
                </Field>
                <div style={grid2}>
                  <Field label="Venue name">
                    <TextInput value={f.venue} onChange={(v) => set('venue', v)} placeholder="Punggol Regional Library" />
                  </Field>
                  <Field label="Address">
                    <TextInput value={f.venueAddress} onChange={(v) => set('venueAddress', v)} placeholder="1 Punggol Drive, One Punggol" />
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard n="5" title="Price" sub="Free listings are welcome and encouraged.">
              <div style={{ display: 'grid', gap: 18 }}>
                <Field label="Is it free or paid?">
                  <ChipSelect options={[{ k: 'free', label: 'Free' }, { k: 'paid', label: 'Paid' }]} value={f.priceType} onChange={(v) => set('priceType', v || 'free')} />
                </Field>
                {f.priceType === 'paid' &&
                  <Field label="Price to show" hint='Use S$. e.g. "From S$16" or "S$25 per child"'>
                    <TextInput value={f.priceDisplay} onChange={(v) => set('priceDisplay', v)} placeholder="From S$16" />
                  </Field>
                }
              </div>
            </SectionCard>

            <SectionCard n="6" title="Links and photo" sub="Where parents can read more and book.">
              <div style={{ display: 'grid', gap: 18 }}>
                <Field label="Booking or info website">
                  <TextInput value={f.website} onChange={(v) => set('website', v)} placeholder="https://" type="url" />
                </Field>
                <Field label="Photo link" hint="A link to a landscape photo of real kids enjoying the activity. We will get in touch if we need a better one.">
                  <TextInput value={f.photoUrl} onChange={(v) => set('photoUrl', v)} placeholder="https://" type="url" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n="7" title="Your details" sub="So we can reach you about the listing. Not shown publicly.">
              <div style={grid2}>
                <Field label="Your name">
                  <TextInput value={f.contactName} onChange={(v) => set('contactName', v)} placeholder="Jane Tan" />
                </Field>
                <Field label="Email" required>
                  <TextInput value={f.contactEmail} onChange={(v) => set('contactEmail', v)} placeholder="you@example.com" type="email" invalid={showErrors && errors.contactEmail} />
                </Field>
              </div>
              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 20, cursor: 'pointer' }}>
                <input type="checkbox" checked={f.agree} onChange={(e) => set('agree', e.target.checked)}
                  style={{ width: 20, height: 20, marginTop: 1, accentColor: '#009B4D', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: showErrors && errors.agree ? '#A4322F' : '#555', lineHeight: 1.5 }}>
                  I am authorised to list this activity and confirm the details are accurate. Jungle may edit listings for clarity.
                </span>
              </label>
            </SectionCard>
            </React.Fragment>}

            {isDeal && <React.Fragment>
            <SectionCard n="1" title="About the deal" sub="What is on offer, and who it is from.">
              <div style={{ display: 'grid', gap: 18 }}>
                <Field label="Merchant or business name" required>
                  <TextInput value={d.merchant} onChange={(v) => setDeal('merchant', v)} placeholder="e.g. KidSTOP Science Centre" invalid={showErrors && dealErrors.merchant} />
                </Field>
                <Field label="Category">
                  <ChipSelect options={DEAL_CATEGORIES} value={d.category} onChange={(v) => setDeal('category', v)} />
                </Field>
                <Field label="What is the offer?" required hint="One line. This is the headline parents will see.">
                  <TextInput value={d.headline} onChange={(v) => setDeal('headline', v)} placeholder="e.g. 20% off admission for kids under 8" invalid={showErrors && dealErrors.headline} />
                </Field>
                <Field label="Details" hint="The fine print. Any conditions, who it applies to, how to redeem.">
                  <TextArea value={d.detail} onChange={(v) => setDeal('detail', v)} placeholder="Flash your code at the counter for 20% off a child ticket. Valid weekdays only, one child per code." />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n="2" title="The offer" sub="The numbers and how long it runs.">
              <div style={grid2}>
                <Field label="Discount" required hint='Short label. e.g. "20% off", "1-for-1", "Free trial"'>
                  <TextInput value={d.discountLabel} onChange={(v) => setDeal('discountLabel', v)} placeholder="20% off" invalid={showErrors && dealErrors.discountLabel} />
                </Field>
                <Field label="Promo code" hint="Leave blank if none is needed.">
                  <TextInput value={d.promo} onChange={(v) => setDeal('promo', v.toUpperCase())} placeholder="SUMMER20" />
                </Field>
                <Field label="Expires on" required hint="The last day families can use it.">
                  <DateInput value={d.expiry} onChange={(v) => setDeal('expiry', v)} invalid={showErrors && dealErrors.expiry} min="2026-06-06" />
                </Field>
                <Field label="Where to redeem" hint='e.g. "In store", "Online at checkout", "Quote when booking"'>
                  <TextInput value={d.redeem} onChange={(v) => setDeal('redeem', v)} placeholder="In store" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n="3" title="Where families use it" sub="The location and which part of the island.">
              <div style={{ display: 'grid', gap: 18 }}>
                <Field label="Area">
                  <ChipSelect options={[...FILTERS.area, { k: 'Online', label: 'Online' }]} value={d.area} onChange={(v) => setDeal('area', v)} />
                </Field>
                <Field label="Location or address" hint="Skip if the deal is online only.">
                  <TextInput value={d.location} onChange={(v) => setDeal('location', v)} placeholder="15 Science Centre Road" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard n="4" title="Your details" sub="So we can verify the deal. Not shown publicly.">
              <div style={{ display: 'grid', gap: 18 }}>
                <Field label="Are you the merchant or a parent?">
                  <RadioRow options={[{ k: 'merchant', label: 'I am the merchant', sub: 'Shows a verified badge' }, { k: 'parent', label: 'I am a parent', sub: 'Shows as community-shared' }]} value={d.submitterType} onChange={(v) => setDeal('submitterType', v)} />
                </Field>
                <div style={grid2}>
                  <Field label="Your name">
                    <TextInput value={d.contactName} onChange={(v) => setDeal('contactName', v)} placeholder="Jane Tan" />
                  </Field>
                  <Field label="Email" required>
                    <TextInput value={d.contactEmail} onChange={(v) => setDeal('contactEmail', v)} placeholder="you@example.com" type="email" invalid={showErrors && dealErrors.contactEmail} />
                  </Field>
                </div>
                <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" checked={d.agree} onChange={(e) => setDeal('agree', e.target.checked)}
                    style={{ width: 20, height: 20, marginTop: 1, accentColor: '#009B4D', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: showErrors && dealErrors.agree ? '#A4322F' : '#555', lineHeight: 1.5 }}>
                    This deal is genuine and currently valid. Jungle may verify it with the merchant and edit for clarity.
                  </span>
                </label>
              </div>
            </SectionCard>
            </React.Fragment>}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
              <Button size="lg" onClick={submit}>{isDeal ? 'Submit deal for review' : 'Submit listing for review'}</Button>
              <Button size="lg" variant="ghost" onClick={() => go(isDeal ? 'deals' : 'browse')}>Cancel</Button>
            </div>
          </div>

          {/* aside */}
          <aside className="submit-aside" style={{ position: 'sticky', top: 96, alignSelf: 'start', display: 'grid', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 18, padding: 22, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
              <h3 style={{ fontFamily: '"Feather Bold", serif', fontSize: 18, color: '#0C3C26', margin: '0 0 16px' }}>How it works</h3>
              {[
                ['Tell us about it', 'Fill in the form. The more detail, the faster the review.'],
                ['We review it', isDeal ? 'Our team checks the deal with the merchant within a few days.' : 'Our team checks the details and the venue within a few days.'],
                ['It goes live', isDeal ? 'Once approved, families can find it on the Deals page.' : 'Once approved, parents can find it in Things to do.']
              ].map(([t, d], i) => (
                <div key={i} style={{ display: 'flex', gap: 13, marginBottom: i < 2 ? 16 : 0 }}>
                  <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 9999, background: '#E5F5ED', color: '#009B4D', fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#181818', marginBottom: 2 }}>{t}</div>
                    <div style={{ fontSize: 13.5, color: '#666', lineHeight: 1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#E5F5ED', border: '1px solid #CDEBD9', borderRadius: 18, padding: 22 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0C3C26', fontWeight: 800, fontSize: 14.5, marginBottom: 8 }}>
                <span style={{ color: '#009B4D' }}>{Ico.sun(18)}</span> It is free to list
              </div>
              <p style={{ fontSize: 13.5, color: '#2f5641', lineHeight: 1.55, margin: 0 }}>
                Listing on Jungle costs nothing. We just want great things for Singapore kids to do. Questions? Email <strong>hello@jungle.baby</strong>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

