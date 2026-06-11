'use client';

import React, { useEffect, useState } from 'react';
import { EVENTS } from '../_components/data.jsx';
import { TopBanner, Nav, Footer } from '../_components/Primitives.jsx';
import { EventDetail } from '../_components/EventDetail.jsx';
import { ShareModal } from '../_components/ShareModal.jsx';
import { use } from 'react';

export default function EventPage({ params }) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState(null);
  const [shareEvent, setShareEvent] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Find the event by ID
    const foundEvent = EVENTS.find(e => e.id === resolvedParams.eventId);
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      setNotFound(true);
    }
  }, [resolvedParams.eventId]);

  const go = (s, payload) => {
    if (s === 'landing' || s === 'browse') {
      // Navigate to main app
      window.location.href = '/';
      // After navigation, trigger the screen change
      setTimeout(() => {
        if (window.__go) {
          window.__go(s, payload);
        }
      }, 100);
    }
  };

  if (notFound) {
    return (
      <div style={{minHeight:'100vh', background:'#fff', fontFamily:'Manrope, sans-serif'}}>
        <TopBanner go={go}/>
        <Nav go={go} theme={null}/>
        <div style={{maxWidth: 600, margin: '80px auto', padding: '0 20px', textAlign: 'center'}}>
          <h1 style={{fontFamily:'"Feather Bold", serif', fontSize: 36, color: '#0C3C26', marginBottom: 16}}>
            Event not found
          </h1>
          <p style={{fontSize: 16, color: '#666', marginBottom: 24}}>
            This event doesn't exist or may have been removed.
          </p>
          <button 
            onClick={() => go('browse')}
            style={{
              background: '#009B4D',
              color: '#fff',
              border: 'none',
              borderRadius: 9999,
              padding: '14px 28px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Browse all events
          </button>
        </div>
        <Footer go={go}/>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{minHeight:'100vh', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{minHeight:'100vh', background:'#fff', fontFamily:'Manrope, sans-serif'}}>
      <TopBanner go={go}/>
      <Nav go={go} theme={null}/>
      <EventDetail go={go} event={event} onShare={setShareEvent}/>
      <Footer go={go}/>
      {shareEvent && <ShareModal event={shareEvent} onClose={() => setShareEvent(null)}/>}
    </div>
  );
}