// ============================================================
// ShareModal — "Send to me" : Email | Phone tabs + confirmation
// Used from cards (share sheet) and event detail.
// ============================================================
import React from 'react';
import { IMG } from './data.jsx';
import { Ico, Button } from './Primitives.jsx';

export function ShareModal({event, onClose}) {
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(null); // null | 'email'
  const [err, setErr] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const url = event ? `https://summer.jungle.baby/${event.id}` : '';
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function send(){
    if (sending) return;
    if (!emailOk){ setErr('Enter a valid email address.'); return; }
    setErr('');
    setSending(true);
    try {
      const res = await fetch('/api/share', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          email: email.trim(),
          eventId: event ? event.id : '',
          eventTitle: event ? event.title : '',
          eventVenue: event ? event.venue : '',
          eventArea: event ? event.area : '',
        }),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok){ setErr(data.error || 'Could not send the email. Try again.'); return; }
      setSent('email');
    } catch {
      setErr('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  // close on Esc
  React.useEffect(()=>{
    const h=(e)=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown', h); return ()=>window.removeEventListener('keydown', h);
  },[]);

  const [copied, setCopied] = React.useState(false);

  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(12,32,22,.5)', backdropFilter:'blur(3px)', zIndex:90, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'Manrope, sans-serif'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff', borderRadius:20, width:'min(440px,100%)', boxShadow:'0 24px 60px rgba(0,0,0,.28)', overflow:'hidden'}}>
        {/* header */}
        <div style={{padding:'20px 22px 0', display:'flex', alignItems:'flex-start', gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:'"Feather Bold", serif', fontSize:22, color:'#0C3C26', lineHeight:1.1}}>Send to me</div>
            <div style={{fontSize:13.5, color:'#666', marginTop:4}}>We'll send a link to {event ? <b style={{color:'#181818'}}>{event.title}</b> : 'this thing to do'}. No login needed.</div>
          </div>
          <button onClick={onClose} style={{width:34, height:34, borderRadius:9999, background:'#F5F5F0', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0, color:'#333', flexShrink:0}}>{Ico.x(18)}</button>
        </div>

        {sent ? (
          <div style={{padding:'26px 22px 28px', textAlign:'center'}}>
            <div style={{width:60, height:60, borderRadius:9999, background:'#E5F5ED', color:'#009B4D', display:'flex', alignItems:'center', justifyContent:'center', margin:'8px auto 16px'}}>{Ico.check(30)}</div>
            <div style={{fontFamily:'"Feather Bold", serif', fontSize:20, color:'#0C3C26', marginBottom:6}}>Sent.</div>
            <div style={{fontSize:14.5, color:'#666', lineHeight:1.5}}>Check your inbox{email ? ` at ${email}` : ''}. The link opens this page.</div>
            <Button variant="outline" style={{marginTop:20}} onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div style={{padding:'18px 22px 24px'}}>
            {/* email only - no tabs */}
            <div>
              <label style={lbl}>Email address</label>
              <input autoFocus value={email} onChange={e=>{setEmail(e.target.value); setErr('');}} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="you@email.com" style={inp(err)}/>
              {err && <div style={errStyle}>{err}</div>}
              <Button style={{width:'100%', marginTop:14, opacity: sending?0.7:1}} onClick={()=>send()}>{sending ? 'Sending…' : 'Send link'}</Button>
            </div>

            {/* copy link */}
            <div style={{display:'flex', alignItems:'center', gap:10, marginTop:18, paddingTop:16, borderTop:'1px solid #F1F1F1'}}>
              <div style={{flex:1, fontSize:13, color:'#666', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{url}</div>
              <button onClick={()=>{ try{navigator.clipboard&&navigator.clipboard.writeText(url);}catch(e){} setCopied(true); setTimeout(()=>setCopied(false),1600); }} style={{display:'inline-flex', alignItems:'center', gap:6, background:'#fff', border:'1px solid #DDDDDD', borderRadius:9999, padding:'8px 14px', fontSize:13, fontWeight:700, color: copied?'#009B4D':'#0C3C26', cursor:'pointer', fontFamily:'inherit'}}>
                {copied ? <>{Ico.check(15)} Copied</> : <>{Ico.link(15)} Copy link</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const lbl = {display:'block', fontSize:13, fontWeight:700, color:'#181818', marginBottom:7};
const inp = (err)=>({width:'100%', height:50, border:`1px solid ${err?'#F63F3C':'#DDDDDD'}`, borderRadius:12, padding:'0 14px', fontFamily:'Manrope, sans-serif', fontSize:15, color:'#181818', background:'#fff', boxSizing:'border-box', outline:'none'});
const errStyle = {color:'#F63F3C', fontSize:12.5, fontWeight:600, marginTop:7};

