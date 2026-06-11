// ============================================================
// Deals — discounts & promos for kids' experiences
// List / grid layouts, thumbs up/down voting (net score),
// ending-soon sort, submitter + verified/community signals,
// report/flag. Submissions route to the "List with us" form.
// ============================================================
import React from 'react';
import { DEALS, DEAL_CATEGORIES, SUBMITTER, daysLeft, expiryText, urgencyTone, netScore, submittedAgo } from './dealsData.jsx';
import { Ico, Button, MetaPill, Chip } from './Primitives.jsx';

// ---- trust badge (who submitted) ----
function SubmitterBadge({ type }) {
  const meta = SUBMITTER[type] || SUBMITTER.parent;
  const tones = {
    green:   { bg:'#E5F5ED', fg:'#0C3C26', bd:'#CDEBD9', icon:true },
    dark:    { bg:'#0C3C26', fg:'#fff', bd:'#0C3C26', icon:true },
    neutral: { bg:'#F2F1EC', fg:'#555', bd:'#E5E4DD', icon:false },
  }[meta.tone];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:tones.bg, color:tones.fg, border:`1px solid ${tones.bd}`, borderRadius:9999, padding:'4px 10px', fontSize:12, fontWeight:700, whiteSpace:'nowrap' }}>
      {tones.icon && <span style={{ display:'inline-flex' }}>{Ico.check(12)}</span>}
      {meta.label}
    </span>
  );
}

// ---- promo code, click to "copy" ----
function PromoCode({ code }) {
  const [copied, setCopied] = React.useState(false);
  const copy = (e) => {
    e.stopPropagation();
    try { navigator.clipboard && navigator.clipboard.writeText(code); } catch (_) {}
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button onClick={copy} title="Copy code" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px dashed #009B4D', color:'#0C3C26', borderRadius:10, padding:'7px 12px', fontFamily:'Manrope, sans-serif', fontWeight:800, fontSize:13.5, letterSpacing:'.04em', cursor:'pointer' }}>
      <span style={{ color:'#009B4D', display:'inline-flex' }}>{Ico.ticket(15)}</span>
      {code}
      <span style={{ fontSize:11.5, fontWeight:700, color:copied?'#009B4D':'#9a9a92' }}>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

// ---- thumbs up/down voter with net score ----
function VoteControl({ deal, vote, onVote, compact }) {
  const net = (deal.up || 0) - (deal.down || 0) + (vote === 'up' ? 1 : 0) + (vote === 'down' ? -1 : 0);
  const Btn = ({ dir }) => {
    const active = vote === dir;
    const up = dir === 'up';
    return (
      <button onClick={(e) => { e.stopPropagation(); onVote(deal.id, dir); }}
        title={up ? 'Good deal' : 'Not great'}
        style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:compact?34:38, height:compact?34:38, borderRadius:10,
          border:'1px solid '+(active ? (up?'#009B4D':'#F0B4B2') : '#E2E1DA'),
          background: active ? (up?'#E5F5ED':'#FDECEA') : '#fff',
          color: active ? (up?'#009B4D':'#D43F3B') : '#8a8a82', cursor:'pointer', transition:'all 140ms' }}>
        {up
          ? <svg width="17" height="17" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM7 10l4.5-7a2 2 0 0 1 3.7 1.2L14 9h5.3a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 18 20H7"/></svg>
          : <svg width="17" height="17" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1zM17 14l-4.5 7a2 2 0 0 1-3.7-1.2L10 15H4.7a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 6 4h11"/></svg>}
      </button>
    );
  };
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:9 }}>
      <Btn dir="up" />
      <div style={{ textAlign:'center', minWidth:38 }}>
        <div style={{ fontSize:16, fontWeight:800, color: net>=0?'#0C3C26':'#C5372F', lineHeight:1 }}>{net>0?'+':''}{net}</div>
        <div style={{ fontSize:10.5, color:'#9a9a92', fontWeight:600, marginTop:2 }}>{(deal.up||0)+(deal.down||0)+(vote?1:0)} votes</div>
      </div>
      <Btn dir="down" />
    </div>
  );
}

// ---- urgency tag ----
function UrgencyTag({ expiry }) {
  const n = daysLeft(expiry);
  const t = urgencyTone(n);
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:t.bg, color:t.fg, borderRadius:9999, padding:'5px 11px', fontSize:12.5, fontWeight:700, whiteSpace:'nowrap' }}>
      <span style={{ width:7, height:7, borderRadius:9999, background:t.dot }} />
      {t.label}
    </span>
  );
}

// ---- one deal as a list row ----
function DealRow({ deal, vote, onVote, onFlag, flagged }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'center', background:'#fff', border:'1px solid #EAEAE4', borderRadius:18, padding:'20px 22px', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }} className="deal-row">
      <div style={{ minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:9 }}>
          <UrgencyTag expiry={deal.expiry} />
          <span style={{ fontSize:13, fontWeight:700, color:'#009B4D' }}>{deal.discountLabel}</span>
          <span style={{ fontSize:12.5, color:'#B7B7AE' }}>·</span>
          <span style={{ fontSize:13, color:'#888' }}>{deal.category}</span>
        </div>
        <div style={{ fontSize:13.5, fontWeight:700, color:'#0C3C26', marginBottom:3 }}>{deal.merchant}</div>
        <h3 style={{ fontFamily:'"Feather Bold", serif', fontSize:20, color:'#181818', margin:'0 0 7px', lineHeight:1.2 }}>{deal.headline}</h3>
        <p style={{ fontSize:14, color:'#666', lineHeight:1.5, margin:'0 0 14px', maxWidth:620 }}>{deal.detail}</p>
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <PromoCode code={deal.promo} />
          <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'#777' }}>
            <span style={{ color:'#009B4D', display:'inline-flex' }}>{Ico.pin(14)}</span>{deal.location}{deal.area && deal.area!=='Online' ? ` · ${deal.area}` : ''}
          </span>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'space-between', gap:16, height:'100%' }} className="deal-row-side">
        <SubmitterBadge type={deal.submittedByType} />
        <VoteControl deal={deal} vote={vote} onVote={onVote} />
        <FlagLink onFlag={onFlag} flagged={flagged} sub={`${deal.submittedBy} · ${submittedAgo(deal.submittedAt)}`} />
      </div>
    </div>
  );
}

// ---- one deal as a grid card ----
function DealCard({ deal, vote, onVote, onFlag, flagged }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', background:'#fff', border:'1px solid #EAEAE4', borderRadius:18, padding:22, boxShadow:'0 2px 8px rgba(0,0,0,.04)', height:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:13 }}>
        <UrgencyTag expiry={deal.expiry} />
        <SubmitterBadge type={deal.submittedByType} />
      </div>
      <div style={{ display:'inline-flex', alignSelf:'flex-start', alignItems:'center', gap:7, background:'#0C3C26', color:'#fff', borderRadius:10, padding:'6px 12px', fontSize:14, fontWeight:800, marginBottom:13 }}>
        <span style={{ color:'#9FE3BD', display:'inline-flex' }}>{Ico.ticket(15)}</span>{deal.discountLabel}
      </div>
      <div style={{ fontSize:13, fontWeight:700, color:'#009B4D', marginBottom:4 }}>{deal.merchant}</div>
      <h3 style={{ fontFamily:'"Feather Bold", serif', fontSize:19, color:'#181818', margin:'0 0 8px', lineHeight:1.2 }}>{deal.headline}</h3>
      <p style={{ fontSize:13.5, color:'#666', lineHeight:1.5, margin:'0 0 14px' }}>{deal.detail}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:16 }}>
        <PromoCode code={deal.promo} />
        <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12.5, color:'#777' }}>
          <span style={{ color:'#009B4D', display:'inline-flex' }}>{Ico.pin(13)}</span>{deal.location}
        </span>
      </div>
      <div style={{ marginTop:'auto', paddingTop:15, borderTop:'1px solid #F0EFE9', display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
        <VoteControl deal={deal} vote={vote} onVote={onVote} compact />
        <FlagLink onFlag={onFlag} flagged={flagged} sub={submittedAgo(deal.submittedAt)} />
      </div>
    </div>
  );
}

// ---- report / flag ----
function FlagLink({ onFlag, flagged, sub }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
      <button onClick={(e) => { e.stopPropagation(); if (!flagged) onFlag(); }}
        style={{ display:'inline-flex', alignItems:'center', gap:5, background:'transparent', border:'none', cursor:flagged?'default':'pointer', color:flagged?'#C5372F':'#A6A69E', fontSize:12, fontWeight:600, fontFamily:'inherit', padding:0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill={flagged?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4a1 1 0 0 1 1-1h12l-2 4 2 4H5"/></svg>
        {flagged ? 'Reported' : 'Report'}
      </button>
      {sub && <span style={{ fontSize:11, color:'#B0B0A7' }}>{sub}</span>}
    </div>
  );
}

// ============================================================
// Deals page
// ============================================================
export function Deals({ go, tweaks, initialCategory }) {
  const def = (tweaks && tweaks.dealsLayout) || 'list';
  const [layout, setLayout] = React.useState(def);
  const [cat, setCat] = React.useState(initialCategory || null);
  const [sort, setSort] = React.useState('ending');
  const [votes, setVotes] = React.useState({});
  const [flags, setFlags] = React.useState({});
  React.useEffect(() => { setLayout((tweaks && tweaks.dealsLayout) || 'list'); }, [tweaks && tweaks.dealsLayout]);
  React.useEffect(() => { setCat(initialCategory || null); }, [initialCategory]);

  const onVote = (id, dir) => setVotes((v) => ({ ...v, [id]: v[id] === dir ? null : dir }));
  const onFlag = (id) => setFlags((f) => ({ ...f, [id]: true }));

  let list = DEALS.filter((d) => !cat || d.category === cat);
  list = [...list].sort((a, b) => {
    if (sort === 'ending') return daysLeft(a.expiry) - daysLeft(b.expiry);
    if (sort === 'top') {
      const na = netScore(a) + (votes[a.id]==='up'?1:votes[a.id]==='down'?-1:0);
      const nb = netScore(b) + (votes[b.id]==='up'?1:votes[b.id]==='down'?-1:0);
      return nb - na;
    }
    if (sort === 'new') return new Date(b.submittedAt) - new Date(a.submittedAt);
    return 0;
  });

  const endingSoonCount = DEALS.filter((d) => { const n = daysLeft(d.expiry); return n > 0 && n <= 7; }).length;

  return (
    <div data-screen-label="Deals" style={{ background:'#F5F5F0', minHeight:'100vh', fontFamily:'Manrope, sans-serif' }}>
      {/* hero band */}
      <div style={{ background:'#0C3C26', color:'#fff', position:'relative', overflow:'hidden' }}>
        <img src="/assets/brand/graphic-02.svg" alt="" style={{ position:'absolute', right:-60, top:-40, width:320, color:'#0f4a2f', opacity:.5 }} />
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'44px clamp(20px,4vw,40px) 48px', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.12)', borderRadius:9999, padding:'6px 14px', fontSize:13, fontWeight:700, marginBottom:16 }}>
            <span style={{ color:'#EEC71B' }}>{Ico.ticket(15)}</span>{endingSoonCount} deals ending this week
          </div>
          <h1 style={{ fontFamily:'"Feather Bold", serif', fontSize:'clamp(32px,4.6vw,46px)', margin:'0 0 12px', lineHeight:1.05, maxWidth:680 }}>Deals on kids' experiences</h1>
          <p style={{ fontSize:17, lineHeight:1.55, opacity:.9, margin:'0 0 24px', maxWidth:560 }}>
            Discounts and promo codes for classes, camps, attractions and more. Shared by merchants and parents. Vote up the good ones.
          </p>
          <Button variant="primary" onClick={() => go('submit', { type:'deal' })}>Submit a deal</Button>
        </div>
      </div>

      {/* controls */}
      <div style={{ position:'sticky', top:72, zIndex:20, background:'rgba(245,245,240,.92)', backdropFilter:'blur(6px)', borderBottom:'1px solid #E6E5DE' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'14px clamp(20px,4vw,40px)', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', flex:1, minWidth:0 }}>
            <Chip active={!cat} onClick={() => setCat(null)}>All</Chip>
            {DEAL_CATEGORIES.map((c) => <Chip key={c.k} active={cat===c.k} onClick={() => setCat(cat===c.k?null:c.k)}>{c.label}</Chip>)}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:13, color:'#888', fontWeight:600 }}>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                style={{ appearance:'none', border:'1px solid #DDD', background:'#fff', borderRadius:10, padding:'9px 30px 9px 13px', fontSize:13.5, fontWeight:600, fontFamily:'inherit', color:'#0C3C26', cursor:'pointer', backgroundImage:'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23666\' stroke-width=\'2.4\' stroke-linecap=\'round\'><path d=\'m6 9 6 6 6-6\'/></svg>")', backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
                <option value="ending">Ending soon</option>
                <option value="top">Top rated</option>
                <option value="new">Newest</option>
              </select>
            </div>
            <div style={{ display:'flex', background:'#fff', border:'1px solid #DDD', borderRadius:10, padding:3, gap:2 }}>
              {[['list', Ico.tiles], ['grid', Ico.grid]].map(([k, ic]) => (
                <button key={k} onClick={() => setLayout(k)} title={k}
                  style={{ width:36, height:32, borderRadius:8, border:'none', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center',
                    background: layout===k ? '#E5F5ED' : 'transparent', color: layout===k ? '#009B4D' : '#9a9a92' }}>{ic(17)}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* list / grid */}
      <div style={{ maxWidth:1180, margin:'0 auto', padding:'24px clamp(20px,4vw,40px) 72px' }}>
        <div style={{ fontSize:13.5, color:'#888', marginBottom:16, fontWeight:600 }}>{list.length} deal{list.length!==1?'s':''}{cat?` in ${cat}`:''}</div>
        {layout === 'list' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {list.map((d) => <DealRow key={d.id} deal={d} vote={votes[d.id]} onVote={onVote} onFlag={() => onFlag(d.id)} flagged={!!flags[d.id]} />)}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:18 }}>
            {list.map((d) => <DealCard key={d.id} deal={d} vote={votes[d.id]} onVote={onVote} onFlag={() => onFlag(d.id)} flagged={!!flags[d.id]} />)}
          </div>
        )}

        {/* submit prompt */}
        <div style={{ marginTop:30, background:'#E5F5ED', border:'1px solid #CDEBD9', borderRadius:18, padding:'26px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
          <div>
            <h3 style={{ fontFamily:'"Feather Bold", serif', fontSize:21, color:'#0C3C26', margin:'0 0 5px' }}>Know a good deal?</h3>
            <p style={{ fontSize:14.5, color:'#2f5641', margin:0, lineHeight:1.5 }}>Merchants and parents can both post. We review every deal before it goes live.</p>
          </div>
          <Button onClick={() => go('submit', { type:'deal' })}>Submit a deal</Button>
        </div>
      </div>
    </div>
  );
}

