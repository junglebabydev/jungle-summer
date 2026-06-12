// ============================================================
// MapPanel — stylized Singapore map with event pins (placeholder)
// ============================================================
import React from 'react';
import { EVENTS, ROWS, FILTERS, IMG, priceText, dedupeLanes } from './data.jsx';
import { Ico, Button } from './Primitives.jsx';
import { EventCard } from './EventCard.jsx';

export function MapPanel({events, hoveredId, setHovered, onOpen, style={}}) {
  return (
    <div style={{position:'relative', width:'100%', height:'100%', borderRadius:18, overflow:'hidden', background:'linear-gradient(180deg,#dceaf2 0%,#cfe6ef 100%)', border:'1px solid #E2E8E2', ...style}}>
      {/* water texture dots */}
      <svg width="100%" height="100%" style={{position:'absolute', inset:0}} preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* landmass blob */}
        <path d="M8,52 C6,40 16,30 30,28 C40,26 46,18 60,20 C74,22 86,24 92,34 C97,42 95,54 90,62 C84,72 72,80 56,82 C40,84 24,82 16,74 C10,68 9,60 8,52 Z" fill="#E7F2E9" stroke="#CFE3D4" strokeWidth="0.6"/>
        {/* a couple of green parks */}
        <ellipse cx="44" cy="44" rx="9" ry="7" fill="#D7EBDC"/>
        <ellipse cx="70" cy="56" rx="7" ry="6" fill="#D7EBDC"/>
      </svg>
      {/* region labels */}
      {[['North','40%','16%'],['North-East','66%','28%'],['Central','50%','48%'],['West','22%','52%'],['East','80%','56%']].map(([t,l,tp])=>(
        <div key={t} style={{position:'absolute', left:l, top:tp, transform:'translate(-50%,-50%)', fontSize:11, fontWeight:700, color:'#5b7a64', letterSpacing:'.04em', textTransform:'uppercase', pointerEvents:'none'}}>{t}</div>
      ))}
      {/* pins */}
      {events.map(e=>{
        const hot = hoveredId===e.id;
        const free = e.priceType==='free';
        return (
          <button key={e.id}
            onMouseEnter={()=>setHovered(e.id)} onMouseLeave={()=>setHovered(null)}
            onClick={()=>onOpen(e)}
            style={{position:'absolute', left:`${e.pin.x}%`, top:`${e.pin.y}%`, transform:`translate(-50%,-100%) scale(${hot?1.12:1})`, transformOrigin:'bottom center', zIndex: hot?20:5, border:'none', background:'transparent', cursor:'pointer', padding:0, transition:'transform 140ms ease'}}>
            <div style={{display:'inline-flex', alignItems:'center', gap:4, background: hot? '#0C3C26' : (free?'#EEC71B':'#fff'), color: hot?'#fff':(free?'#3a2e00':'#0C3C26'), fontFamily:'Manrope,sans-serif', fontWeight:800, fontSize:12.5, padding:'5px 10px', borderRadius:9999, boxShadow:'0 4px 12px rgba(0,0,0,.22)', whiteSpace:'nowrap', border:'2px solid #fff'}}>
              {priceText(e)}
            </div>
            <div style={{width:0, height:0, borderLeft:'5px solid transparent', borderRight:'5px solid transparent', borderTop:`7px solid ${hot?'#0C3C26':'#fff'}`, margin:'0 auto'}}/>
          </button>
        );
      })}
      {/* hovered tooltip */}
      {hoveredId && (()=>{ const e=events.find(x=>x.id===hoveredId); if(!e) return null; return (
        <div style={{position:'absolute', left:`${e.pin.x}%`, top:`${e.pin.y}%`, transform:'translate(-50%, 14px)', zIndex:30, background:'#fff', borderRadius:12, boxShadow:'0 12px 28px rgba(0,0,0,.2)', width:200, overflow:'hidden', pointerEvents:'none'}}>
          <div style={{height:84, backgroundImage:`url(${IMG(e.img)})`, backgroundSize:'cover', backgroundPosition:'center'}}/>
          <div style={{padding:'8px 10px'}}>
            <div style={{fontSize:13, fontWeight:700, color:'#181818', lineHeight:1.2}}>{e.title}</div>
            <div style={{fontSize:11.5, color:'#666', marginTop:2}}>{e.area} · {priceText(e)}</div>
          </div>
        </div>
      ); })()}
    </div>
  );
}

// ============================================================
// FilterDropdown — pill button that opens an options popover
// ============================================================
export function FilterDropdown({label, options, value, onChange, open, setOpen}) {
  const sel = options.find(o=>o.k===value);
  const active = !!value;
  return (
    <div style={{position:'relative'}}>
      <button onClick={()=>setOpen(open?null:label)} style={{display:'inline-flex', alignItems:'center', gap:7, height:42, padding:'0 14px', borderRadius:9999, border:'1px solid '+(active?'#009B4D':'#DDDDDD'), background: active?'#E5F5ED':'#fff', color: active?'#0C3C26':'#333', fontFamily:'Manrope,sans-serif', fontSize:14, fontWeight: active?700:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all 150ms ease'}}>
        {active ? (sel ? sel.label : value) : label}
        <span style={{transform:open===label?'rotate(180deg)':'none', transition:'transform 150ms ease', display:'inline-flex', opacity:.7}}>{Ico.chev(15,'down')}</span>
      </button>
      {open===label && (
        <>
          <div onClick={()=>setOpen(null)} style={{position:'fixed', inset:0, zIndex:40}}/>
          <div style={{position:'absolute', top:48, left:0, zIndex:41, background:'#fff', borderRadius:14, boxShadow:'0 14px 36px rgba(0,0,0,.16)', border:'1px solid #EEE', padding:7, minWidth:184}}>
            <button onClick={()=>{onChange(null); setOpen(null);}} style={optRow(!active)}>Any {label.toLowerCase()}</button>
            {options.map(o=>(
              <button key={o.k} onClick={()=>{onChange(o.k); setOpen(null);}} style={optRow(value===o.k)}>
                {o.label}{value===o.k && <span style={{color:'#009B4D'}}>{Ico.check(16)}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
const optRow = (on)=>({display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', textAlign:'left', padding:'10px 12px', borderRadius:9, border:'none', background: on?'#F2FAF5':'transparent', color: on?'#0C3C26':'#333', fontFamily:'Manrope,sans-serif', fontSize:14, fontWeight: on?700:500, cursor:'pointer'});

// ============================================================
// Row — horizontal scrollable card row (browse mode)
// ============================================================
function Row({title, events, cardProps}) {
  const ref = React.useRef(null);
  if (!events.length) return null;
  const scroll = (dir)=>{ if(ref.current) ref.current.scrollBy({left:dir*560, behavior:'smooth'}); };
  return (
    <section style={{marginBottom:40}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
        <h2 style={{fontFamily:'"Feather Bold", serif', fontSize:26, color:'#0C3C26', margin:0}}>{title}</h2>
        <div style={{display:'flex', gap:8}}>
          {[['left',Ico.chev(18,'left')],['right',Ico.chev(18,'right')]].map(([d,ic])=>(
            <button key={d} onClick={()=>scroll(d==='left'?-1:1)} style={{width:38, height:38, borderRadius:9999, border:'1px solid #DDD', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#0C3C26'}}>{ic}</button>
          ))}
        </div>
      </div>
      <div ref={ref} className="hide-scroll" style={{display:'flex', gap:18, overflowX:'auto', scrollSnapType:'x mandatory', paddingBottom:4, margin:'0 -4px', padding:'4px'}}>
        {events.map(e=>(
          <div key={e.id} style={{flex:'0 0 320px', maxWidth:320, scrollSnapAlign:'start'}}>
            <EventCard e={e} {...cardProps(e)}/>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// Browse / Results
// ============================================================
export function Browse({go, tweaks, onShare, initialFilters}) {
  const [filters, setFilters] = React.useState({age:null, when:null, area:null, price:null, type:null, ...(initialFilters||{})});
  const [openMenu, setOpenMenu] = React.useState(null);
  const [hoveredId, setHovered] = React.useState(null);
  const [showExpired, setShowExpired] = React.useState(false);
  const mapMode = tweaks.mapPlacement; // 'collapsed' | 'left'
  const [showMap, setShowMap] = React.useState(mapMode==='left');
  React.useEffect(()=>{ setShowMap(mapMode==='left'); }, [mapMode]);

  const setF = (k,v)=> setFilters(f=>({...f, [k]:v}));
  const anyFilter = Object.values(filters).some(Boolean);
  const clearAll = ()=> setFilters({age:null, when:null, area:null, price:null, type:null});

  const match = (e)=> (
    (showExpired || e.status!=='expired') &&
    (!filters.age || e.age.includes(filters.age)) &&
    (!filters.when || e.when.includes(filters.when)) &&
    (!filters.area || e.area===filters.area) &&
    (!filters.price || (filters.price==='free'? e.priceType==='free' : e.priceType!=='free')) &&
    (!filters.type || e.type===filters.type)
  );
  const filtered = EVENTS.filter(match);
  const expiredCount = EVENTS.filter(e=>e.status==='expired').length;

  // view mode: rows only in browse-mode (no filters) AND tweak says rows AND map hidden
  const useRows = !anyFilter && tweaks.browseDefault==='rows' && !showMap;

  // Deduped lanes: an event shows only in the first row it matches, so the same
  // card never repeats across swim lanes. Render order = claim priority.
  const rowLanes = React.useMemo(()=> dedupeLanes(ROWS), []);

  const cardProps = (e)=>({
    onOpen:()=>go('detail', e),
    onShare:()=>onShare(e),
  });

  return (
    <div data-screen-label="02 Browse" style={{background:'#F5F5F0', minHeight:'100vh', fontFamily:'Manrope, sans-serif'}}>
      {/* page head */}
      <div style={{background:'#fff', borderBottom:'1px solid #EEE'}}>
        <div style={{maxWidth:1320, margin:'0 auto', padding:'26px clamp(20px,4vw,40px) 0'}}>
          <div style={{fontSize:13, color:'#666', marginBottom:6}}>
            <a href="#" onClick={e=>{e.preventDefault(); go('landing');}} style={{color:'#009B4D', textDecoration:'none', fontWeight:600}}>Summer in SG</a>
            <span> · Things to do</span>
          </div>
          <h1 style={{fontFamily:'"Feather Bold", serif', fontSize:'clamp(28px,3.6vw,38px)', color:'#0C3C26', margin:'2px 0 4px'}}>Things to do this June</h1>
          <div style={{color:'#666', fontSize:15, marginBottom:18}}>{filtered.length} {filtered.length===1?'thing':'things'} to do across Singapore</div>

          {/* sticky filter bar */}
          <div style={{position:'sticky', top:72, zIndex:25, background:'#fff', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', padding:'12px 0', borderTop:'1px solid #F4F4F0'}}>
            <FilterDropdown label="Age" options={FILTERS.age} value={filters.age} onChange={v=>setF('age',v)} open={openMenu} setOpen={setOpenMenu}/>
            <FilterDropdown label="When" options={FILTERS.when} value={filters.when} onChange={v=>setF('when',v)} open={openMenu} setOpen={setOpenMenu}/>
            <FilterDropdown label="Area" options={FILTERS.area} value={filters.area} onChange={v=>setF('area',v)} open={openMenu} setOpen={setOpenMenu}/>
            <FilterDropdown label="Price" options={FILTERS.price} value={filters.price} onChange={v=>setF('price',v)} open={openMenu} setOpen={setOpenMenu}/>
            <FilterDropdown label="Type" options={FILTERS.type} value={filters.type} onChange={v=>setF('type',v)} open={openMenu} setOpen={setOpenMenu}/>
            {anyFilter && <button onClick={clearAll} style={{height:42, padding:'0 12px', border:'none', background:'transparent', color:'#009B4D', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit'}}>Clear all</button>}
            <div style={{flex:1}}/>
            {expiredCount>0 &&
              <button onClick={()=>setShowExpired(s=>!s)} title="Show things to do that have ended" style={{display:'inline-flex', alignItems:'center', gap:9, height:42, padding:'0 14px', borderRadius:9999, border:'1px solid '+(showExpired?'#009B4D':'#DDD'), background: showExpired?'#E5F5ED':'#fff', color: showExpired?'#0C3C26':'#555', fontFamily:'inherit', fontSize:14, fontWeight:700, cursor:'pointer'}}>
                <span style={{position:'relative', width:34, height:20, borderRadius:9999, background: showExpired?'#009B4D':'#CFCFC8', transition:'background 150ms'}}>
                  <span style={{position:'absolute', top:2, left: showExpired?16:2, width:16, height:16, borderRadius:9999, background:'#fff', transition:'left 150ms', boxShadow:'0 1px 3px rgba(0,0,0,.25)'}}/>
                </span>
                Show expired
              </button>}
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{maxWidth:1320, margin:'0 auto', padding:'26px clamp(20px,4vw,40px) 80px'}}>
        {showMap ? (
          <div style={{display:'grid', gridTemplateColumns:'minmax(0,1.05fr) minmax(0,1fr)', gap:24, alignItems:'start'}}>
            <div style={{position:'sticky', top:140, height:'calc(100vh - 170px)', minHeight:460}}>
              <MapPanel events={filtered} hoveredId={hoveredId} setHovered={setHovered} onOpen={(e)=>go('detail',e)} style={{height:'100%'}}/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:18}}>
              {filtered.map(e=>(
                <div key={e.id} onMouseEnter={()=>setHovered(e.id)} onMouseLeave={()=>setHovered(null)} style={{outline: hoveredId===e.id?'2px solid #009B4D':'2px solid transparent', borderRadius:18, transition:'outline-color 140ms'}}>
                  <EventCard e={e} {...cardProps(e)}/>
                </div>
              ))}
              {!filtered.length && <Empty clearAll={clearAll}/>}
            </div>
          </div>
        ) : useRows ? (
          <div>
            {rowLanes.map(r=>(<Row key={r.key} title={r.title} events={r.events} cardProps={cardProps}/>))}
          </div>
        ) : (
          <div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px,1fr))', gap:20}}>
              {filtered.map(e=>(<EventCard key={e.id} e={e} {...cardProps(e)}/>))}
            </div>
            {!filtered.length && <Empty clearAll={clearAll}/>}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({clearAll}){
  return <div style={{gridColumn:'1/-1', textAlign:'center', padding:'70px 20px', color:'#666'}}>
    <div style={{fontFamily:'"Feather Bold",serif', fontSize:22, color:'#0C3C26', marginBottom:8}}>Nothing matches just yet</div>
    <div style={{fontSize:15, marginBottom:18}}>Try widening your filters to see more of what's on.</div>
    <Button variant="outline" onClick={clearAll}>Clear all filters</Button>
  </div>;
}

