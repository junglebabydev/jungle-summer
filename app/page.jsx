'use client';

// ============================================================
// App — router + shared state + Tweaks panel
// Ported from Summer in SG.html SPA. Single-route shell that
// flips between landing / browse / detail / deals / submit.
// ============================================================

import React, { useState, useEffect } from 'react';
import { FILTERS } from './_components/data.jsx';
import { Ico, Button, TopBanner, Nav, Footer } from './_components/Primitives.jsx';
import { Landing, HERO_THEMES } from './_components/Landing.jsx';
import { Browse } from './_components/Browse.jsx';
import { EventDetail } from './_components/EventDetail.jsx';
import { Deals } from './_components/Deals.jsx';
import { SubmitListing } from './_components/SubmitListing.jsx';
import { ShareModal } from './_components/ShareModal.jsx';
import { Contact } from './_components/Contact.jsx';
import { AboutUs } from './_components/AboutUs.jsx';
import {
  useTweaks, TweaksPanel, TweakSection,
  TweakToggle, TweakRadio,
} from './_components/tweaks-panel.jsx';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "homeLayout": "focused",
  "heroColor": "green",
  "browseDefault": "rows",
  "mapPlacement": "collapsed",
  "heroStickers": true,
  "dealsLayout": "list"
}/*EDITMODE-END*/;

// ---- Family wizard (Get started) ----
function FamilyWizard({onClose, onDone}) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState(null);
  const [when, setWhen] = useState(null);
  useEffect(()=>{ const h=(e)=>{ if(e.key==='Escape') onClose(); }; window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h); },[]);

  const steps = [
    { q:'How old are your kids?', sub:'We will match the right age range.', opts:FILTERS.age, val:age, set:setAge },
    { q:'When are you free?', sub:'June is packed. Let us narrow it down.', opts:FILTERS.when, val:when, set:setWhen },
  ];
  const s = steps[step];
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(12,32,22,.5)', backdropFilter:'blur(3px)', zIndex:90, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'Manrope, sans-serif'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff', borderRadius:22, width:'min(460px,100%)', boxShadow:'0 24px 60px rgba(0,0,0,.28)', padding:'28px 26px 26px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
          <div style={{display:'flex', gap:6}}>{steps.map((_,i)=>(<span key={i} style={{width:i===step?22:8, height:8, borderRadius:9999, background:i<=step?'#009B4D':'#E0E0E0', transition:'all 200ms'}}/>))}</div>
          <button onClick={onClose} style={{width:32, height:32, borderRadius:9999, background:'#F5F5F0', border:'none', cursor:'pointer', color:'#333'}}>{Ico.x(17)}</button>
        </div>
        <h2 style={{fontFamily:'"Feather Bold",serif', fontSize:26, color:'#0C3C26', margin:'10px 0 4px', lineHeight:1.1}}>{s.q}</h2>
        <p style={{fontSize:14.5, color:'#666', margin:'0 0 20px'}}>{s.sub}</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22}}>
          {s.opts.map(o=>(
            <button key={o.k} onClick={()=>s.set(o.k)} style={{padding:'16px 12px', borderRadius:14, border:'2px solid '+(s.val===o.k?'#009B4D':'#E5E5E0'), background:s.val===o.k?'#E5F5ED':'#fff', color:s.val===o.k?'#0C3C26':'#333', fontFamily:'inherit', fontSize:15, fontWeight:700, cursor:'pointer', transition:'all 150ms'}}>{o.label}{s.q.includes('old')&&o.k!=='all'?' y.o':''}</button>
          ))}
        </div>
        <div style={{display:'flex', gap:10}}>
          {step>0 && <Button variant="ghost" onClick={()=>setStep(step-1)}>Back</Button>}
          <Button style={{flex:1}} onClick={()=>{ if(step<steps.length-1){ setStep(step+1); } else { onDone({age, when}); } }}>
            {step<steps.length-1 ? 'Next' : 'Show me what’s on'}
          </Button>
        </div>
        <button onClick={()=>onDone({})} style={{width:'100%', marginTop:14, background:'transparent', border:'none', color:'#858585', fontFamily:'inherit', fontSize:13.5, fontWeight:600, cursor:'pointer'}}>Skip, just browse everything</button>
      </div>
    </div>
  );
}

export default function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  // Hydration: initial render must match the server's (no localStorage).
  // We mount with 'landing', then on the client restore the saved screen.
  const [screen, setScreen] = useState('landing');
  const [event, setEvent] = useState(null);
  const [shareEvent, setShareEvent] = useState(null);
  const [wizard, setWizard] = useState(false);
  const [prefilter, setPrefilter] = useState({});
  const [submitType, setSubmitType] = useState('activity');
  const [dealsCategory, setDealsCategory] = useState(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sg-screen') : null;
    if (saved && saved !== 'landing') setScreen(saved);
  }, []);

  const go = (s, payload)=>{
    if (s==='browse' && payload && payload.wizard){ setWizard(true); return; }
    if (s==='browse' && payload && payload.filters) {
      setPrefilter(payload.filters);
    } else if (s==='browse' && !(payload && payload.keepFilters)) {
      setPrefilter({});
    }
    if (s==='detail') setEvent(payload);
    if (s==='submit') setSubmitType(payload && payload.type ? payload.type : 'activity');
    if (s==='deals') setDealsCategory(payload && payload.category ? payload.category : null);
    setScreen(s);
    if (typeof window !== 'undefined') { localStorage.setItem('sg-screen', s); window.scrollTo(0,0); }
  };
  if (typeof window !== 'undefined') window.__go = go;

  const heroTheme = HERO_THEMES[t.heroColor] || HERO_THEMES.green;
  const navTheme = screen==='landing' ? heroTheme.nav : null;

  return (
    <div style={{minHeight:'100vh', background:'#fff', fontFamily:'Manrope, sans-serif'}}>
      {screen!=='landing' && <TopBanner go={go}/>}
      {screen!=='landing' && <Nav go={go} theme={navTheme}/>}

      {screen==='landing' && <Landing go={go} themeKey={t.heroColor} showStickers={t.heroStickers} homeLayout={t.homeLayout} onShare={setShareEvent}/>}
      {screen==='browse' && <Browse key={'browse-'+JSON.stringify(prefilter)} go={go} tweaks={t} onShare={setShareEvent} initialFilters={prefilter}/>}
      {screen==='detail' && <EventDetail go={go} event={event} onShare={setShareEvent}/>}
      {screen==='deals' && <Deals go={go} tweaks={t} initialCategory={dealsCategory}/>}
      {screen==='submit' && <SubmitListing go={go} initialType={submitType}/>}
      {screen==='contact' && <Contact />}
      {screen==='about' && <AboutUs />}

      {screen!=='landing' && <Footer go={go}/>}

      {shareEvent && <ShareModal event={shareEvent} onClose={()=>setShareEvent(null)}/>}
      {wizard && <FamilyWizard onClose={()=>setWizard(false)} onDone={(f)=>{ setPrefilter(f); setWizard(false); setScreen('browse'); if (typeof window !== 'undefined') { localStorage.setItem('sg-screen','browse'); window.scrollTo(0,0); } }}/>}

      {/* ---- Tweaks panel ---- */}
      <TweaksPanel>
        <TweakSection label="Homepage"/>
        <TweakRadio label="Layout" value={t.homeLayout} options={['focused','editorial','spotlight']} onChange={v=>setTweak('homeLayout', v)}/>
        <TweakSection label="Hero"/>
        <TweakRadio label="Background colour" value={t.heroColor} options={['green','coral','yellow']} onChange={v=>setTweak('heroColor', v)}/>
        <TweakToggle label="Floating photo stickers" value={t.heroStickers} onChange={v=>setTweak('heroStickers', v)}/>
        <TweakSection label="Browse / results"/>
        <TweakRadio label="Default layout" value={t.browseDefault} options={['rows','grid']} onChange={v=>setTweak('browseDefault', v)}/>
        <TweakRadio label="Map placement" value={t.mapPlacement} options={['collapsed','left']} onChange={v=>setTweak('mapPlacement', v)}/>
        <TweakSection label="Deals"/>
        <TweakRadio label="Default layout" value={t.dealsLayout} options={['list','grid']} onChange={v=>setTweak('dealsLayout', v)}/>
      </TweaksPanel>
    </div>
  );
}
