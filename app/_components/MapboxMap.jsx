'use client';

import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IMG, priceText } from './data.jsx';

const MAPBOX_TOKEN = 'pk.eyJ1IjoianVuZ2xlLWRldnMiLCJhIjoiY21xZXdja3YzMDFyZjJyc2QydGU2cXo2MyJ9.JARSzPk7NciIkmJcPrMPAQ';

// Helper to get simple price text
function getSimpleMapPrice(e) {
  if (!e) return "Paid";
  if (e.priceType === "free") return "Free";
  
  if (e.price && typeof e.price === 'string') {
    const priceMatch = e.price.match(/\$\d+(-\$?\d+)?/);
    if (priceMatch) return priceMatch[0];
    if (e.price.startsWith('$')) {
      return e.price.split(/[\s,]/)[0];
    }
    if (e.price.toLowerCase().includes('mixed')) return "Mixed";
    if (e.price.toLowerCase().includes('paid')) return "Paid";
  }
  return "Paid";
}

export function MapboxMap({ events, hoveredId, setHovered, onOpen, style = {} }) {
  const [popupInfo, setPopupInfo] = useState(null);
  const [viewState, setViewState] = useState({
    latitude: 1.3521,  // Singapore center
    longitude: 103.8198,
    zoom: 11,
    pitch: 0,
    bearing: 0
  });

  // Filter events with valid coordinates
  const validEvents = events.filter(e => {
    if (e.lat && e.lng) {
      // Check if coordinates are within Singapore bounds
      return e.lat >= 1.15 && e.lat <= 1.48 && e.lng >= 103.55 && e.lng <= 104.1;
    }
    return false;
  });

  // Handle hover from external source
  useEffect(() => {
    if (hoveredId) {
      const event = validEvents.find(e => e.id === hoveredId);
      if (event) {
        setPopupInfo(event);
      }
    } else {
      setPopupInfo(null);
    }
  }, [hoveredId, validEvents]);

  return (
    <div style={{ 
      position: 'relative',
      width: '100%', 
      height: '100%',
      borderRadius: 18,
      overflow: 'hidden',
      border: '1px solid #E2E8E2',
      ...style 
    }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[]}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Render markers for events */}
        {validEvents.map((event) => {
          const isHovered = hoveredId === event.id;
          const isFree = event.priceType === "free";
          
          return (
            <Marker
              key={event.id}
              longitude={event.lng}
              latitude={event.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onOpen(event);
              }}
            >
              <div
                onMouseEnter={() => {
                  setHovered(event.id);
                  setPopupInfo(event);
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  setPopupInfo(null);
                }}
                style={{
                  cursor: 'pointer',
                  transform: `scale(${isHovered ? 1.15 : 1})`,
                  transition: 'transform 140ms ease',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: isHovered ? '#0C3C26' : isFree ? '#EEC71B' : '#fff',
                    color: isHovered ? '#fff' : isFree ? '#3a2e00' : '#0C3C26',
                    fontFamily: 'Manrope, sans-serif',
                    fontWeight: 800,
                    fontSize: 12,
                    padding: '6px 12px',
                    borderRadius: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,.22)',
                    whiteSpace: 'nowrap',
                    border: '2px solid #fff',
                    minWidth: 44,
                    minHeight: 28,
                    justifyContent: 'center',
                  }}
                >
                  {getSimpleMapPrice(event)}
                </div>
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `8px solid ${isHovered ? '#0C3C26' : '#fff'}`,
                    margin: '0 auto',
                  }}
                />
              </div>
            </Marker>
          );
        })}

        {/* Popup for hovered event */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            offset={20}
          >
            <div
              style={{
                width: 200,
                overflow: 'hidden',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              <div
                style={{
                  height: 84,
                  backgroundImage: `url(${IMG(popupInfo.img)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  margin: -10,
                  marginBottom: 0,
                }}
              />
              <div style={{ padding: '8px 0' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#181818',
                    lineHeight: 1.2,
                  }}
                >
                  {popupInfo.title}
                </div>
                <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>
                  {popupInfo.area} · {getSimpleMapPrice(popupInfo)}
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}