'use client';

import dynamic from 'next/dynamic';

// Dynamically import the MapboxMap component with no SSR
const MapboxMap = dynamic(
  () => import('./MapboxMap.jsx').then((mod) => mod.MapboxMap),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(180deg,#dceaf2 0%,#cfe6ef 100%)',
        borderRadius: 18,
        border: '1px solid #E2E8E2'
      }}>
        <div style={{ color: '#666', fontFamily: 'Manrope, sans-serif' }}>Loading map...</div>
      </div>
    )
  }
);

export default MapboxMap;