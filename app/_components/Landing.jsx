// ============================================================
// Landing / Hero — three homepage layouts (tweakable)
//   focused   : NYC-style single CTA card on full-bleed colour
//   editorial : compact hero + real event rails below (no clicks)
//   spotlight : split hero with live "This week's picks" panel
// Hero colour is tweakable: green | coral | yellow
// ============================================================

import React from 'react';
import { EVENTS, ROWS, IMG, priceText, dedupeLanes } from './data.jsx';
import { Ico, Button, MetaPill, Nav, Footer } from './Primitives.jsx';
import { EventCard } from './EventCard.jsx';

export const HERO_THEMES = {
  green: {
    key:'green',
    bg:'radial-gradient(120% 120% at 50% 0%, #15512f 0%, #0C3C26 38%, #082c1c 100%)',
    word:'#FFF6E3', outline:'#06281a', accent:'#EEC71B', sub:'rgba(255,255,255,.92)',
    nav:{fg:'#ffffff', logoColor:false, fgIsDark:false},
  },
  coral: {
    key:'coral',
    bg:'radial-gradient(120% 120% at 50% 0%, #FF7A4D 0%, #F2683C 42%, #DD4F23 100%)',
    word:'#FFF6E3', outline:'#9a3414', accent:'#0C3C26', sub:'rgba(255,255,255,.95)',
    nav:{fg:'#ffffff', logoColor:false, fgIsDark:false},
  },
  yellow: {
    key:'yellow',
    bg:'radial-gradient(120% 120% at 50% 0%, #FFE08A 0%, #F4C430 44%, #E8B41C 100%)',
    word:'#ffffff', outline:'#0C3C26', accent:'#009B4D', sub:'#1c4a32',
    nav:{fg:'#0C3C26', logoColor:true, fgIsDark:true},
  },
};

// chunky die-cut sticker outline via stacked text-shadows
function stickerShadow(color, r=3.5){
  const ring=[];
  for(let a=0;a<360;a+=18){ const x=Math.cos(a*Math.PI/180)*r, y=Math.sin(a*Math.PI/180)*r; ring.push(`${x.toFixed(1)}px ${y.toFixed(1)}px 0 ${color}`); }
  ring.push('0 10px 18px rgba(0,0,0,.22)');
  return ring.join(', ');
}

function StickerWordmark({theme, size='lg', align='center'}) {
  const S = size==='lg'
    ? { a:'clamp(64px,11vw,132px)', b:'clamp(38px,6.5vw,76px)', sun:56, r1:4, r2:3.2 }
    : { a:'clamp(44px,6.4vw,82px)', b:'clamp(27px,4vw,48px)', sun:38, r1:3, r2:2.4 };
  return (
    <div style={{textAlign:align, position:'relative', userSelect:'none'}}>
      <div style={{display:'inline-block', transform:'rotate(-3deg)'}}>
        <div style={{fontFamily:'"Feather Bold", serif', color:theme.word, textShadow:stickerShadow(theme.outline, S.r1), fontSize:S.a, lineHeight:.92, letterSpacing:'-0.01em'}}>Summer</div>
      </div>
      <div style={{display:'inline-block', transform:'rotate(2deg)', marginTop:-6}}>
        <div style={{display:'inline-flex', alignItems:'center', gap:12}}>
          <span style={{fontFamily:'"Feather Bold", serif', color:theme.word, textShadow:stickerShadow(theme.outline, S.r2), fontSize:S.b, lineHeight:1}}>in SG</span>
          <span style={{display:'inline-flex', color:theme.accent, filter:'drop-shadow(0 4px 8px rgba(0,0,0,.18))', transform:'translateY(-3px)'}}>{Ico.sun(S.sun)}</span>
        </div>
      </div>
    </div>
  );
}

function FloatStickers() {
  const items = [
    { img:'p1', top:'16%', left:'7%', size:128, rot:-8 },
    { img:'p5', top:'58%', left:'5%', size:108, rot:7 },
    { img:'p2', top:'15%', right:'7%', size:118, rot:9 },
    { img:'p4', top:'60%', right:'6%', size:120, rot:-6 },
  ];
  return (<div className="float-stickers" style={{position:'absolute', inset:0, pointerEvents:'none', zIndex:1}}>
    {items.map((it,i)=>(
      <div key={i} style={{position:'absolute', top:it.top, left:it.left, right:it.right, width:it.size, height:it.size, transform:`rotate(${it.rot}deg)`, borderRadius:22, backgroundImage:`url(${IMG(it.img)})`, backgroundSize:'cover', backgroundPosition:'center', border:'5px solid #fff', boxShadow:'0 14px 30px rgba(0,0,0,.22)'}}/>
    ))}
  </div>);
}

// quick category chips — navigate to browse
function HeroChips({theme, go}) {
  const yellow = theme.key==='yellow';
  return (
    <div style={{display:'flex', gap:10, flexWrap:'wrap', justifyContent:'inherit'}}>
      {['Free things to do','This weekend','0–3 y.o','Festivals on now','Outdoor play'].map(t=>(
        <button key={t} onClick={()=>go('browse')} style={{background: yellow?'rgba(255,255,255,.55)':'rgba(255,255,255,.16)', color:theme.nav.fg, border:`1px solid ${yellow?'rgba(12,60,38,.18)':'rgba(255,255,255,.4)'}`, borderRadius:9999, padding:'9px 16px', fontSize:13.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit', backdropFilter:'blur(6px)', transition:'all 160ms ease'}}
          onMouseEnter={e=>e.currentTarget.style.background = yellow?'rgba(255,255,255,.85)':'rgba(255,255,255,.28)'}
          onMouseLeave={e=>e.currentTarget.style.background = yellow?'rgba(255,255,255,.55)':'rgba(255,255,255,.16)'}>{t}</button>
      ))}
    </div>
  );
}

// horizontal event rail (used on editorial / spotlight)
function LandingRail({title, sub, events, cardProps, accent='#0C3C26'}) {
  const ref = React.useRef(null);
  if (!events.length) return null;
  const scroll=(d)=>{ if(ref.current) ref.current.scrollBy({left:d*560, behavior:'smooth'}); };
  return (
    <section style={{marginBottom:44}}>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:16}}>
        <div>
          <h2 style={{fontFamily:'"Feather Bold", serif', fontSize:'clamp(24px,3vw,30px)', color:'#0C3C26', margin:0}}>{title}</h2>
          {sub && <div style={{fontSize:14.5, color:'#666', marginTop:4}}>{sub}</div>}
        </div>
        <div style={{display:'flex', gap:8}}>
          {[['left',Ico.chev(18,'left')],['right',Ico.chev(18,'right')]].map(([d,ic])=>(
            <button key={d} onClick={()=>scroll(d==='left'?-1:1)} style={{width:40, height:40, borderRadius:9999, border:'1px solid #DDD', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#0C3C26'}}>{ic}</button>
          ))}
        </div>
      </div>
      <div ref={ref} className="hide-scroll" style={{display:'flex', gap:18, overflowX:'auto', scrollSnapType:'x mandatory', padding:'4px'}}>
        {events.map(e=>(
          <div key={e.id} style={{flex:'0 0 320px', maxWidth:320, scrollSnapAlign:'start'}}>
            <EventCard e={e} {...cardProps(e)}/>
          </div>
        ))}
      </div>
    </section>
  );
}

// compact horizontal list item — used in spotlight "picks" panel
function PickItem({e, onOpen}) {
  const free = e.priceType==='free';
  return (
    <div onClick={onOpen} style={{display:'flex', gap:14, alignItems:'center', padding:10, borderRadius:14, cursor:'pointer', transition:'background 150ms'}}
      onMouseEnter={ev=>ev.currentTarget.style.background='#F5F5F0'} onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
      <div style={{width:78, height:78, borderRadius:12, flexShrink:0, backgroundImage:`url(${IMG(e.img)})`, backgroundSize:'cover', backgroundPosition:'center', position:'relative'}}>
        {free && <div style={{position:'absolute', top:5, left:5, background:'#EEC71B', color:'#3a2e00', fontSize:9.5, fontWeight:800, padding:'2px 6px', borderRadius:9999}}>Free</div>}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:15, fontWeight:700, color:'#181818', lineHeight:1.25, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{e.title}</div>
        <div style={{fontSize:12.5, color:'#009B4D', fontWeight:600, marginBottom:3}}>{e.provider}</div>
        <div style={{fontSize:12.5, color:'#666', display:'flex', alignItems:'center', gap:5}}><span style={{color:'#009B4D'}}>{Ico.pin(12)}</span>{e.area} · {e.ageLabel} y.o</div>
      </div>
      <div style={{textAlign:'right', flexShrink:0}}>
        <div style={{fontWeight:800, color:'#181818', fontSize:14}}>{priceText(e)}</div>
        <div style={{marginTop:6, color:'#009B4D', display:'inline-flex'}}>{Ico.chev(18)}</div>
      </div>
    </div>
  );
}

// ---------- shared CTA buttons ----------
function HeroCTAs({go, justify='center'}) {
  return (
    <div style={{display:'flex', gap:12, justifyContent:justify, flexWrap:'wrap'}}>
      <Button size="lg" onClick={()=>go('browse', {wizard:true})} style={{minWidth:160}}>Get started</Button>
      <Button size="lg" variant="outline" onClick={()=>go('browse')} style={{minWidth:160}}>Browse all</Button>
    </div>
  );
}

// ============================================================
// LAYOUT 1 — Focused (original)
// ============================================================
function LandingFocused({go, theme, showStickers}) {
  return (
    <div style={{minHeight:'100vh', background:theme.bg, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', fontFamily:'Manrope, sans-serif'}}>
      <img src="/assets/brand/graphic-01.svg" alt="" style={{position:'absolute', width:680, opacity:.07, top:-160, right:-160, color: theme.key==='yellow'?'#0C3C26':'#fff', pointerEvents:'none'}}/>
      <Nav go={go} theme={theme.nav}/>
      {showStickers && <FloatStickers/>}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px 72px', position:'relative', zIndex:2}}>
        <div style={{display:'inline-flex', alignItems:'center', gap:8, whiteSpace:'nowrap', background: theme.key==='yellow'?'rgba(12,60,38,.10)':'rgba(255,255,255,.16)', border:`1px solid ${theme.key==='yellow'?'rgba(12,60,38,.22)':'rgba(255,255,255,.4)'}`, color:theme.nav.fg, borderRadius:9999, padding:'8px 16px', fontSize:13, fontWeight:700, marginBottom:30, backdropFilter:'blur(6px)'}}>
          {Ico.cal(15)} June school holidays · 2 to 30 June
        </div>
        <div style={{marginBottom:34}}><StickerWordmark theme={theme}/></div>
        <div style={{background:'#fff', borderRadius:26, boxShadow:'0 26px 70px rgba(0,0,0,.24)', padding:'clamp(28px,4vw,44px)', maxWidth:560, width:'100%', textAlign:'center', border:'1px solid rgba(0,0,0,.04)'}}>
          <h1 style={{fontFamily:'"Feather Bold", serif', fontSize:'clamp(30px,4.4vw,42px)', color:'#0C3C26', margin:'0 0 14px', lineHeight:1.06}}>Find something fun to do this June</h1>
          <p style={{fontSize:16.5, color:'#666', lineHeight:1.55, margin:'0 auto 26px', maxWidth:440}}>Singapore has dozens of free and low-cost things happening this school holiday. Tell us a bit about your family and we'll show you what's on.</p>
          <HeroCTAs go={go}/>
          <div style={{fontSize:13, color:'#858585', marginTop:20, display:'flex', alignItems:'center', justifyContent:'center', gap:7}}>
            <span style={{color:'#009B4D'}}>{Ico.check(15)}</span> Free to browse. No sign-up needed.
          </div>
        </div>
        <div style={{marginTop:26, maxWidth:620, display:'flex', justifyContent:'center'}}><HeroChips theme={theme} go={go}/></div>
      </div>
    </div>
  );
}

// ============================================================
// LAYOUT 2 — Editorial : compact hero + live event rails
// ============================================================
function LandingEditorial({go, theme, cardProps}) {
  return (
    <div style={{background:'#F5F5F0', fontFamily:'Manrope, sans-serif'}}>
      <section style={{position:'relative', background:theme.bg, overflow:'hidden'}}>
        <img src="/assets/brand/graphic-02.svg" alt="" style={{position:'absolute', width:520, opacity:.08, top:-120, right:-120, color: theme.key==='yellow'?'#0C3C26':'#fff', pointerEvents:'none'}}/>
        <Nav go={go} theme={theme.nav}/>
        <div style={{maxWidth:1256, margin:'0 auto', padding:'44px clamp(20px,4vw,48px) 64px', position:'relative', zIndex:2, textAlign:'center'}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:8, whiteSpace:'nowrap', background: theme.key==='yellow'?'rgba(12,60,38,.10)':'rgba(255,255,255,.16)', border:`1px solid ${theme.key==='yellow'?'rgba(12,60,38,.22)':'rgba(255,255,255,.4)'}`, color:theme.nav.fg, borderRadius:9999, padding:'7px 15px', fontSize:13, fontWeight:700, marginBottom:22, backdropFilter:'blur(6px)'}}>
            {Ico.cal(15)} June school holidays · 2 to 30 June
          </div>
          <div style={{display:'flex', justifyContent:'center', marginBottom:18}}><StickerWordmark theme={theme} size="md"/></div>
          <p style={{fontSize:'clamp(16px,2vw,19px)', color:theme.sub, maxWidth:600, margin:'0 auto 26px', lineHeight:1.5, fontWeight:500}}>Dozens of free and low-cost things to do with the kids this school holiday. Scroll through what's on, or tell us about your family.</p>
          <div style={{marginBottom:24}}><HeroCTAs go={go}/></div>
          <div style={{display:'flex', justifyContent:'center'}}><HeroChips theme={theme} go={go}/></div>
        </div>
        <div style={{height:48, background:'linear-gradient(180deg, transparent, #F5F5F0)'}}/>
      </section>

      <div style={{maxWidth:1256, margin:'0 auto', padding:'40px clamp(20px,4vw,48px) 72px'}}>
        {(()=>{ const lanes = dedupeLanes([ROWS[0], ROWS[1], ROWS[2]]); return <>
          <LandingRail title="Happening this week" sub="Fresh things to do, updated daily" events={lanes[0].events} cardProps={cardProps}/>
          <LandingRail title="Free things to do" sub="Great days out that cost nothing" events={lanes[1].events} cardProps={cardProps}/>
          <LandingRail title="Festivals on now" sub="Children's Season, Winnie the Pooh and more" events={lanes[2].events} cardProps={cardProps}/>
        </>; })()}
      </div>
      <Footer/>
    </div>
  );
}

// ============================================================
// LAYOUT 3 — Spotlight : split hero w/ live "This week's picks"
// ============================================================
function LandingSpotlight({go, theme, cardProps}) {
  const picks = EVENTS.filter(e=>e.status!=='expired' && (e.when.includes('today')||e.when.includes('week'))).slice(0,4);
  const yellow = theme.key==='yellow';
  return (
    <div style={{background:'#F5F5F0', fontFamily:'Manrope, sans-serif'}}>
      <section style={{position:'relative', background:theme.bg, overflow:'hidden'}}>
        <img src="/assets/brand/graphic-03.svg" alt="" style={{position:'absolute', width:560, opacity:.07, bottom:-180, left:-140, color: yellow?'#0C3C26':'#fff', pointerEvents:'none'}}/>
        <Nav go={go} theme={theme.nav}/>
        <div style={{maxWidth:1256, margin:'0 auto', padding:'clamp(36px,5vw,64px) clamp(20px,4vw,48px) clamp(48px,6vw,72px)', position:'relative', zIndex:2, display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,460px)', gap:'clamp(28px,4vw,56px)', alignItems:'center'}}>
          {/* left */}
          <div>
            <div style={{display:'inline-flex', alignItems:'center', gap:8, whiteSpace:'nowrap', background: yellow?'rgba(12,60,38,.10)':'rgba(255,255,255,.16)', border:`1px solid ${yellow?'rgba(12,60,38,.22)':'rgba(255,255,255,.4)'}`, color:theme.nav.fg, borderRadius:9999, padding:'7px 15px', fontSize:13, fontWeight:700, marginBottom:22, backdropFilter:'blur(6px)'}}>
              {Ico.cal(15)} June school holidays · 2 to 30 June
            </div>
            <StickerWordmark theme={theme} size="md" align="left"/>
            <p style={{fontSize:'clamp(16px,1.7vw,18.5px)', color:theme.sub, maxWidth:480, margin:'18px 0 26px', lineHeight:1.5, fontWeight:500}}>Singapore has dozens of free and low-cost things happening this June. Here's a taste of what's on right now.</p>
            <HeroCTAs go={go} justify="flex-start"/>
            <div style={{marginTop:24}}><HeroChips theme={theme} go={go}/></div>
          </div>
          {/* right — live picks panel */}
          <div style={{background:'#fff', borderRadius:22, boxShadow:'0 26px 70px rgba(0,0,0,.26)', padding:'18px 16px 14px', border:'1px solid rgba(0,0,0,.04)'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 10px 12px'}}>
              <div style={{fontFamily:'"Feather Bold",serif', fontSize:18, color:'#0C3C26'}}>This week's picks</div>
              <span style={{fontSize:12.5, color:'#009B4D', fontWeight:700, display:'inline-flex', alignItems:'center', gap:5, background:'#E5F5ED', padding:'5px 10px', borderRadius:9999}}>{Ico.sun(13)} {picks.length} on now</span>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:2}}>
              {picks.map(e=>(<PickItem key={e.id} e={e} onOpen={()=>go('detail',e)}/>))}
            </div>
            <button onClick={()=>go('browse')} style={{width:'100%', marginTop:10, height:46, borderRadius:12, border:'1px solid #DDD', background:'#fff', color:'#0C3C26', fontWeight:700, fontSize:14.5, cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6}}
              onMouseEnter={e=>e.currentTarget.style.background='#F5F5F0'} onMouseLeave={e=>e.currentTarget.style.background='#fff'}>See everything on this June {Ico.chev(16)}</button>
          </div>
        </div>
        <div style={{height:48, background:'linear-gradient(180deg, transparent, #F5F5F0)'}}/>
      </section>

      <div style={{maxWidth:1256, margin:'0 auto', padding:'40px clamp(20px,4vw,48px) 72px'}}>
        {(()=>{ const lanes = dedupeLanes([ROWS[1], ROWS[5]]); return <>
          <LandingRail title="Free things to do" sub="Great days out that cost nothing" events={lanes[0].events} cardProps={cardProps}/>
          <LandingRail title="Outdoor and active" sub="Parks, beaches and playgrounds" events={lanes[1].events} cardProps={cardProps}/>
        </>; })()}
      </div>
      <Footer/>
    </div>
  );
}

// ============================================================
// Router
// ============================================================
export function Landing({go, themeKey, showStickers=true, homeLayout='focused', onShare}) {
  const theme = HERO_THEMES[themeKey] || HERO_THEMES.green;
  const cardProps = (e)=>({ onOpen:()=>go('detail', e), onShare:()=>onShare(e) });
  return (
    <div data-screen-label="01 Landing">
      {homeLayout==='editorial' ? <LandingEditorial go={go} theme={theme} cardProps={cardProps}/>
        : homeLayout==='spotlight' ? <LandingSpotlight go={go} theme={theme} cardProps={cardProps}/>
        : <LandingFocused go={go} theme={theme} showStickers={showStickers}/>}
    </div>
  );
}

