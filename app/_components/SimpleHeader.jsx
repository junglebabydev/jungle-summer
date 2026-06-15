import React from 'react';

export function SimpleHeader() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderBottom: '1px solid #E5E7EB',
      zIndex: 50,
      height: 60,
      fontFamily: 'Manrope, sans-serif'
    }}>
      <div style={{
        maxWidth: 1256,
        margin: '0 auto',
        padding: '0 20px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <a href="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          textDecoration: 'none',
          gap: 8
        }}>
          <div style={{
            fontFamily: '"Feather Bold", serif',
            fontSize: 24,
            color: '#0C3C26',
            fontWeight: 'bold'
          }}>
            Jungle
          </div>
          <span style={{
            width: 20,
            height: 20,
            display: 'inline-flex',
            color: '#EEC71B'
          }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </span>
        </a>
        
        <nav style={{ display: 'flex', gap: 40 }}>
          <a href="https://jungle.baby" style={{
            color: '#374151',
            textDecoration: 'none',
            fontSize: 15,
            fontWeight: 500,
            transition: 'color 200ms'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#0C3C26'}
          onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
            Explore
          </a>
          <a href="/" style={{ 
            color: '#374151', 
            textDecoration: 'none', 
            fontSize: 15, 
            fontWeight: 500,
            transition: 'color 200ms'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#0C3C26'}
          onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
            Summer
          </a>
          <a href="/contact" style={{ 
            color: '#374151', 
            textDecoration: 'none', 
            fontSize: 15, 
            fontWeight: 500,
            transition: 'color 200ms'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#0C3C26'}
          onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}