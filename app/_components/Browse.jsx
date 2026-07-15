// ============================================================
// MapPanel — stylized Singapore map with event pins (placeholder)
// ============================================================
import React from "react";
import { ROWS, FILTERS, IMG, priceText, dedupeLanes } from "./data.jsx";
import { Ico, Button } from "./Primitives.jsx";
import { EventCard } from "./EventCard.jsx";
import { MapIcon } from "lucide-react";
import { fetchLiveEvents } from './liveEvents.js';
import MapboxMap from './MapboxWrapper.jsx';

// Helper function to get simple price text for map display
function getSimpleMapPrice(e) {
  if (!e) return "Paid";
  if (e.priceType === "free") return "Free";
  
  // Try to extract a simple price from the display text
  if (e.price && typeof e.price === 'string') {
    // Look for patterns like $10, $20-30, etc
    const priceMatch = e.price.match(/\$\d+(-\$?\d+)?/);
    if (priceMatch) return priceMatch[0];
    // If it starts with a dollar sign, take the first word
    if (e.price.startsWith('$')) {
      return e.price.split(/[\s,]/)[0];
    }
    // Check for "Mixed" or other simple keywords
    if (e.price.toLowerCase().includes('mixed')) return "Mixed";
    if (e.price.toLowerCase().includes('paid')) return "Paid";
  }
  return "Paid"; // Fallback for complex prices
}

export function MapPanel({
  events,
  hoveredId,
  setHovered,
  onOpen,
  style = {},
}) {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 768
  );
  
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const isMobile = windowWidth < 768;
  
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 18,
        overflow: "hidden",
        background: "linear-gradient(180deg,#dceaf2 0%,#cfe6ef 100%)",
        border: "1px solid #E2E8E2",
        ...style,
      }}
    >
      {/* water texture dots */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {/* landmass blob */}
        <path
          d="M8,52 C6,40 16,30 30,28 C40,26 46,18 60,20 C74,22 86,24 92,34 C97,42 95,54 90,62 C84,72 72,80 56,82 C40,84 24,82 16,74 C10,68 9,60 8,52 Z"
          fill="#E7F2E9"
          stroke="#CFE3D4"
          strokeWidth="0.6"
        />
        {/* a couple of green parks */}
        <ellipse cx="44" cy="44" rx="9" ry="7" fill="#D7EBDC" />
        <ellipse cx="70" cy="56" rx="7" ry="6" fill="#D7EBDC" />
      </svg>
      {/* region labels */}
      {[
        ["North", "40%", "16%"],
        ["North-East", "66%", "28%"],
        ["Central", "50%", "48%"],
        ["West", "22%", "52%"],
        ["East", "80%", "56%"],
      ].map(([t, l, tp]) => (
        <div
          key={t}
          style={{
            position: "absolute",
            left: l,
            top: tp,
            transform: "translate(-50%,-50%)",
            fontSize: 11,
            fontWeight: 700,
            color: "#5b7a64",
            letterSpacing: ".04em",
            textTransform: "uppercase",
            pointerEvents: "none",
          }}
        >
          {t}
        </div>
      ))}
      {/* pins - filter to only show valid Singapore coordinates */}
      {events.filter(e => {
        // Only show events with valid coordinates
        if (e.lat && e.lng) {
          // Check if coordinates are within Singapore bounds
          return e.lat >= 1.15 && e.lat <= 1.48 && e.lng >= 103.55 && e.lng <= 104.1;
        }
        // Show events with legacy pin coordinates
        return e.pin;
      }).map((e) => {
        const hot = hoveredId === e.id;
        const free = e.priceType === "free";
        
        // Use lat/lng if available, otherwise fallback to pin coordinates
        let pinPosition;
        if (e.lat && e.lng) {
          // Convert lat/lng to percentage positions for Singapore map
          // More accurate Singapore bounds based on actual geography
          // Singapore mainland: lat 1.22-1.47, lng 103.6-104.03
          const minLat = 1.22;
          const maxLat = 1.47;
          const minLng = 103.62;
          const maxLng = 104.02;
          
          // Calculate position with adjusted scaling for the stylized map
          let xPercent = ((e.lng - minLng) / (maxLng - minLng)) * 80; // Scale to 80% width
          let yPercent = (1 - (e.lat - minLat) / (maxLat - minLat)) * 70; // Scale to 70% height
          
          // Offset to center the pins on the landmass
          xPercent += 15; // Shift right
          yPercent += 20; // Shift down
          
          // Clamp values to keep pins within the green landmass area
          pinPosition = { 
            x: Math.max(20, Math.min(85, xPercent)), 
            y: Math.max(25, Math.min(75, yPercent)) 
          };
          
          // Debug log for troubleshooting
          if (e.lat < minLat || e.lat > maxLat || e.lng < minLng || e.lng > maxLng) {
            console.log(`Event outside Singapore bounds: ${e.title} at lat:${e.lat}, lng:${e.lng}`);
          }
        } else if (e.pin) {
          // Use legacy pin coordinates if available
          pinPosition = e.pin;
        } else {
          // Default fallback position (center of map)
          pinPosition = { x: 50, y: 50 };
        }
        return (
          <button
            key={e.id}
            onMouseEnter={() => setHovered(e.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onOpen(e)}
            style={{
              position: "absolute",
              left: `${pinPosition.x}%`,
              top: `${pinPosition.y}%`,
              transform: `translate(-50%,-100%) scale(${hot ? 1.12 : 1})`,
              transformOrigin: "bottom center",
              zIndex: hot ? 20 : 5,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 0,
              transition: "transform 140ms ease",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: hot ? "#0C3C26" : free ? "#EEC71B" : "#fff",
                color: hot ? "#fff" : free ? "#3a2e00" : "#0C3C26",
                fontFamily: "Manrope,sans-serif",
                fontWeight: 800,
                fontSize: isMobile ? 11 : 12.5,
                padding: isMobile ? "6px 12px" : "5px 10px",
                borderRadius: 9999,
                boxShadow: "0 4px 12px rgba(0,0,0,.22)",
                whiteSpace: "nowrap",
                border: "2px solid #fff",
                minWidth: isMobile ? 44 : "auto",
                minHeight: isMobile ? 32 : "auto",
                justifyContent: "center",
              }}
            >
              {getSimpleMapPrice(e)}
            </div>
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: `7px solid ${hot ? "#0C3C26" : "#fff"}`,
                margin: "0 auto",
              }}
            />
          </button>
        );
      })}
      {/* hovered tooltip */}
      {hoveredId &&
        (() => {
          const e = events.find((x) => x.id === hoveredId);
          if (!e) return null;
          // Use lat/lng if available, otherwise fallback to pin coordinates
          let pinPosition;
          if (e.lat && e.lng) {
            // Convert lat/lng to percentage positions for Singapore map
            // Use same conversion as pins for consistency
            const minLat = 1.22;
            const maxLat = 1.47;
            const minLng = 103.62;
            const maxLng = 104.02;
            
            // Calculate position with adjusted scaling for the stylized map
            let xPercent = ((e.lng - minLng) / (maxLng - minLng)) * 80; // Scale to 80% width
            let yPercent = (1 - (e.lat - minLat) / (maxLat - minLat)) * 70; // Scale to 70% height
            
            // Offset to center the pins on the landmass
            xPercent += 15; // Shift right
            yPercent += 20; // Shift down
            
            // Clamp values to keep tooltips within the green landmass area
            pinPosition = { 
              x: Math.max(20, Math.min(85, xPercent)), 
              y: Math.max(25, Math.min(75, yPercent)) 
            };
          } else if (e.pin) {
            pinPosition = e.pin;
          } else {
            pinPosition = { x: 50, y: 50 };
          }
          // Calculate if tooltip would go off screen
          const tooltipLeft = pinPosition.x > 70 ? "auto" : `${pinPosition.x}%`;
          const tooltipRight = pinPosition.x > 70 ? `${100 - pinPosition.x}%` : "auto";
          const tooltipTransform = pinPosition.x > 70 
            ? "translateX(50%)" 
            : pinPosition.x < 30 
              ? "translateX(-20%)" 
              : "translateX(-50%)";
              
          return (
            <div
              style={{
                position: "absolute",
                left: tooltipLeft,
                right: tooltipRight,
                top: `${pinPosition.y}%`,
                transform: `${tooltipTransform} translateY(14px)`,
                zIndex: 30,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 12px 28px rgba(0,0,0,.2)",
                width: 200,
                maxWidth: "90%",
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  height: 84,
                  backgroundImage: `url(${IMG(e.img)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ padding: "8px 10px" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#181818",
                    lineHeight: 1.2,
                  }}
                >
                  {e.title}
                </div>
                <div style={{ fontSize: 11.5, color: "#666", marginTop: 2 }}>
                  {e.area} · {getSimpleMapPrice(e)}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

// ============================================================
// FilterDropdown — pill button that opens an options popover
// ============================================================
export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  open,
  setOpen,
}) {
  const sel = options.find((o) => o.k === value);
  const active = !!value;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(open ? null : label)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          height: 42,
          padding: "0 14px",
          borderRadius: 9999,
          border: "1px solid " + (active ? "#009B4D" : "#DDDDDD"),
          background: active ? "#E5F5ED" : "#fff",
          color: active ? "#0C3C26" : "#333",
          fontFamily: "Manrope,sans-serif",
          fontSize: 14,
          fontWeight: active ? 700 : 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 150ms ease",
        }}
      >
        {active ? (sel ? sel.label : value) : label}
        <span
          style={{
            transform: open === label ? "rotate(180deg)" : "none",
            transition: "transform 150ms ease",
            display: "inline-flex",
            opacity: 0.7,
          }}
        >
          {Ico.chev(15, "down")}
        </span>
      </button>
      {open === label && (
        <>
          <div
            onClick={() => setOpen(null)}
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: "absolute",
              top: 48,
              left: 0,
              zIndex: 41,
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 14px 36px rgba(0,0,0,.16)",
              border: "1px solid #EEE",
              padding: 7,
              minWidth: 184,
            }}
          >
            <button
              onClick={() => {
                onChange(null);
                setOpen(null);
              }}
              style={optRow(!active)}
            >
              Any {label.toLowerCase()}
            </button>
            {options.map((o) => (
              <button
                key={o.k}
                onClick={() => {
                  onChange(o.k);
                  setOpen(null);
                }}
                style={optRow(value === o.k)}
              >
                {o.label}
                {value === o.k && (
                  <span style={{ color: "#009B4D" }}>{Ico.check(16)}</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
const optRow = (on) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 9,
  border: "none",
  background: on ? "#F2FAF5" : "transparent",
  color: on ? "#0C3C26" : "#333",
  fontFamily: "Manrope,sans-serif",
  fontSize: 14,
  fontWeight: on ? 700 : 500,
  cursor: "pointer",
});

// ============================================================
// SwipeView — Tinder-like card swiping
// ============================================================
function SwipeView({ events, cardProps }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [swipeDirection, setSwipeDirection] = React.useState(null);

  if (events.length === 0) {
    return <Empty clearAll={() => {}} />;
  }

  const currentEvent = events[currentIndex];

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (currentIndex < events.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0); // Loop back to start
      }
      setSwipeDirection(null);
    }, 300);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 10px",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "min(380px, calc(100vw - 40px))",
          height: "min(520px, calc(100vh - 200px))",
          overflow: "visible",
        }}
      >
        {/* Stacked cards behind, so it's clear there are more to swipe through */}
        {events.length > 1 &&
          [2, 1].map((depth) =>
            events.length <= depth ? null : (
              <div
                key={`stack-${depth}`}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: depth * 10,
                  left: depth * 10,
                  right: depth * 10,
                  height: "100%",
                  borderRadius: 20,
                  background: "#fff",
                  border: "1px solid #ECEAE3",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.07)",
                  zIndex: 0,
                }}
              />
            ),
          )}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 1,
            transform:
              swipeDirection === "left"
                ? "translateX(-120%) rotate(-25deg)"
                : swipeDirection === "right"
                  ? "translateX(120%) rotate(25deg)"
                  : "none",
            opacity: swipeDirection ? 0 : 1,
            transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))",
            background: "#f5f5f1",
          }}
        >
          <div
            style={{
              borderRadius: 20,
              height: "100%",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  height: "50%",
                  minHeight: 200,
                  backgroundImage: `url(${IMG(currentEvent.img)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                {currentEvent.priceType === "free" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      background: "#FFC107",
                      color: "#000",
                      padding: "8px 16px",
                      borderRadius: 16,
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    Free
                  </div>
                )}
                {currentEvent.status === "expired" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      left: 20,
                      background: "rgba(0,0,0,.7)",
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ENDED
                  </div>
                )}
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: '"Feather Bold",serif',
                      fontSize: "clamp(20px, 5vw, 24px)",
                      color: "#0C3C26",
                      margin: "0 0 8px",
                      lineHeight: 1.1,
                    }}
                  >
                    {currentEvent.title}
                  </h2>
                  {currentEvent.organizer && (
                    <div
                      style={{
                        fontSize: "clamp(12px, 3vw, 14px)",
                        color: "#666",
                        marginBottom: 12,
                      }}
                    >
                      {currentEvent.organizer}
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#F5F5F0",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: "clamp(11px, 3vw, 13px)",
                        color: "#333",
                      }}
                    >
                      {Ico.pin(14)} {currentEvent.area}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#F5F5F0",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: "clamp(11px, 3vw, 13px)",
                        color: "#333",
                      }}
                    >
                      {Ico.cal(14)}{" "}
                      {currentEvent.when
                        .map(
                          (w) =>
                            FILTERS.when.find((x) => x.k === w)?.label || w,
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: "#F5F5F0",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: "clamp(11px, 3vw, 13px)",
                        color: "#333",
                      }}
                    >
                      {currentEvent.age
                        .map(
                          (a) =>
                            FILTERS.age.find((x) => x.k === a)?.label ||
                            "All ages",
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                    {currentEvent.type && (
                      <span
                        style={{
                          background: "#F5F5F0",
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontSize: "clamp(11px, 3vw, 13px)",
                          color: "#333",
                        }}
                      >
                        {currentEvent.type === "indoor"
                          ? "Indoor"
                          : currentEvent.type === "outdoor"
                            ? "Outdoor"
                            : currentEvent.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "clamp(24px, 8vw, 40px)",
          marginTop: 20,
        }}
      >
        <button
          onClick={() => handleSwipe("left")}
          style={{
            width: "clamp(48px, 12vw, 56px)",
            height: "clamp(48px, 12vw, 56px)",
            borderRadius: 9999,
            border: "2px solid #FF4458",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms",
          }}
        >
          <span
            style={{
              color: "#FF4458",
              fontSize: "clamp(18px, 4vw, 22px)",
              fontWeight: "bold",
            }}
          >
            ✕
          </span>
        </button>
        <button
          onClick={() => cardProps(currentEvent).onShare()}
          style={{
            width: "clamp(40px, 10vw, 44px)",
            height: "clamp(40px, 10vw, 44px)",
            borderRadius: 9999,
            border: "2px solid #44BBA4",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          <span style={{ fontSize: "clamp(16px, 3vw, 18px)" }}>🔗</span>
        </button>
        <button
          onClick={() => handleSwipe("right")}
          style={{
            width: "clamp(48px, 12vw, 56px)",
            height: "clamp(48px, 12vw, 56px)",
            borderRadius: 9999,
            border: "2px solid #44BBA4",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms",
          }}
        >
          <span
            style={{
              color: "#44BBA4",
              fontSize: "clamp(18px, 4vw, 22px)",
              fontWeight: "bold",
            }}
          >
            ✓
          </span>
        </button>
      </div>

      <div
        style={{
          fontSize: "clamp(11px, 3vw, 13px)",
          color: "#999",
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Swipe or use ← → keys · Tap ✓ for details
      </div>

      <div
        style={{
          fontSize: "clamp(11px, 3vw, 12px)",
          color: "#666",
          marginTop: 8,
        }}
      >
        {currentIndex + 1} / {events.length}
      </div>
    </div>
  );
}

// ============================================================
// SwipeableFilters — horizontal scrollable filter cards
// ============================================================
function SwipeableFilters({ filters, setF }) {
  const scrollRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    }
  };

  const quickFilters = [
    {
      label: "Free activities",
      filter: () => setF("price", "free"),
      active: filters.price === "free",
    },
    {
      label: "This weekend",
      filter: () => setF("when", "weekend"),
      active: filters.when === "weekend",
    },
    {
      label: "Under 5",
      filter: () => setF("age", "under5"),
      active: filters.age === "under5",
    },
    {
      label: "Central area",
      filter: () => setF("area", "Central"),
      active: filters.area === "Central",
    },
    {
      label: "Outdoor fun",
      filter: () => setF("type", "outdoor"),
      active: filters.type === "outdoor",
    },
    {
      label: "Indoor activities",
      filter: () => setF("type", "indoor"),
      active: filters.type === "indoor",
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          style={{
            position: "absolute",
            left: -10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: "#fff",
            border: "1px solid #DDD",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,.1)",
          }}
        >
          {Ico.chev(16, "left")}
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          style={{
            position: "absolute",
            right: -10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: "#fff",
            border: "1px solid #DDD",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,.1)",
          }}
        >
          {Ico.chev(16, "right")}
        </button>
      )}
      <div
        ref={scrollRef}
        className="hide-scroll"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 4,
        }}
      >
        {quickFilters.map((qf, i) => (
          <button
            key={i}
            onClick={qf.filter}
            style={{
              flex: "0 0 auto",
              padding: "12px 20px",
              borderRadius: 12,
              border: `2px solid ${qf.active ? "#009B4D" : "#E5E5E0"}`,
              background: qf.active ? "#E5F5ED" : "#fff",
              color: qf.active ? "#0C3C26" : "#333",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: qf.active ? 700 : 600,
              cursor: "pointer",
              scrollSnapAlign: "start",
              transition: "all 150ms",
            }}
          >
            {qf.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ListCard — horizontal list card for list view
// ============================================================
function ListCard({ e, onOpen, onShare }) {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 768,
  );

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  return (
    <div
      onClick={onOpen}
      style={{
        display: "flex",
        gap: isMobile ? 12 : 16,
        padding: isMobile ? 12 : 16,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #E5E5E0",
        cursor: "pointer",
        transition: "all 150ms",
        flexDirection: isSmallMobile ? "column" : "row",
      }}
    >
      <div
        style={{
          width: isSmallMobile ? "100%" : isMobile ? 100 : 140,
          height: isSmallMobile ? 180 : isMobile ? 100 : 140,
          flexShrink: 0,
          borderRadius: 12,
          backgroundImage: `url(${IMG(e.img)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {e.priceType === "free" && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "#FFC107",
              color: "#000",
              padding: "5px 12px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            Free
          </div>
        )}
        {e.status === "expired" && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "rgba(0,0,0,.7)",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            ENDED
          </div>
        )}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minWidth: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: isMobile ? 11 : 12,
              color: "#666",
              marginBottom: 4,
            }}
          >
            {e.area}
          </div>
          <h3
            style={{
              fontFamily: '"Feather Bold",serif',
              fontSize: isMobile ? 16 : 20,
              color: "#0C3C26",
              margin: "0 0 6px",
              lineHeight: 1.2,
              wordBreak: "break-word",
            }}
          >
            {e.title}
          </h3>
          {e.organizer && !isSmallMobile && (
            <div
              style={{
                fontSize: isMobile ? 12 : 13,
                color: "#666",
                marginBottom: 4,
              }}
            >
              {e.organizer}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: isMobile ? 11 : 12,
                color: "#666",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {Ico.cal(12)}{" "}
              {e.when
                .map((w) => FILTERS.when.find((x) => x.k === w)?.label || w)
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
          {!isSmallMobile && (
            <p
              style={{
                fontSize: isMobile ? 12 : 13,
                color: "#666",
                margin: "0 0 8px",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {e.desc}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: isSmallMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            marginTop: isMobile ? 8 : 10,
            paddingTop: 8,
            borderTop: "1px solid #F0F0EC",
            flexDirection: isSmallMobile ? "column" : "row",
            gap: isSmallMobile ? 8 : 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isSmallMobile ? "row" : "column",
              alignItems: isSmallMobile ? "center" : "flex-start",
              gap: isSmallMobile ? 12 : 2,
              width: isSmallMobile ? "100%" : "auto",
              justifyContent: isSmallMobile ? "space-between" : "flex-start",
            }}
          >
            <div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 18,
                  color: e.priceType === "free" ? "#009B4D" : "#0C3C26",
                }}
              >
                {priceText(e)}
              </span>
              {e.when.length > 0 && !isSmallMobile && (
                <div style={{ fontSize: 10, color: "#999" }}>
                  {e.when.length === 1
                    ? FILTERS.when.find((x) => x.k === e.when[0])?.label
                    : "Multiple dates"}
                </div>
              )}
            </div>
            {!isSmallMobile && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    background: "#F5F5F0",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  {e.age
                    .map(
                      (a) =>
                        FILTERS.age.find((x) => x.k === a)?.label || "All ages",
                    )
                    .filter(Boolean)
                    .join(", ")}
                </span>
                {e.type && (
                  <span
                    style={{
                      background: "#F5F5F0",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      color: "#666",
                    }}
                  >
                    {e.type === "indoor"
                      ? "Indoor"
                      : e.type === "outdoor"
                        ? "Outdoor"
                        : e.type}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onShare();
              }}
              style={{
                padding: isSmallMobile ? "6px 12px" : "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "#F5F5F0",
                cursor: "pointer",
                fontSize: isMobile ? 12 : 13,
                color: "#333",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Share
            </button>
          </div>
          {isSmallMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <span
                style={{
                  background: "#F5F5F0",
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "#666",
                }}
              >
                {e.age
                  .map(
                    (a) =>
                      FILTERS.age.find((x) => x.k === a)?.label || "All ages",
                  )
                  .filter(Boolean)
                  .join(", ")}
              </span>
              {e.type && (
                <span
                  style={{
                    background: "#F5F5F0",
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  {e.type === "indoor"
                    ? "Indoor"
                    : e.type === "outdoor"
                      ? "Outdoor"
                      : e.type}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Row — horizontal scrollable card row (browse mode)
// ============================================================
function Row({ title, events, cardProps }) {
  const ref = React.useRef(null);
  if (!events.length) return null;
  const scroll = (dir) => {
    if (ref.current)
      ref.current.scrollBy({ left: dir * 560, behavior: "smooth" });
  };
  return (
    <section style={{ marginBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            fontFamily: '"Feather Bold", serif',
            fontSize: 26,
            color: "#0C3C26",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            ["left", Ico.chev(18, "left")],
            ["right", Ico.chev(18, "right")],
          ].map(([d, ic]) => (
            <button
              key={d}
              onClick={() => scroll(d === "left" ? -1 : 1)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 9999,
                border: "1px solid #DDD",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0C3C26",
              }}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={ref}
        className="hide-scroll"
        style={{
          display: "flex",
          gap: 18,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 4,
          margin: "0 -4px",
          padding: "4px",
        }}
      >
        {events.map((e) => (
          <div
            key={e.id}
            style={{
              flex: "0 0 320px",
              maxWidth: 320,
              scrollSnapAlign: "start",
            }}
          >
            <EventCard e={e} {...cardProps(e)} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// Browse / Results
// ============================================================
export function Browse({ go, tweaks, onShare, initialFilters }) {
  const [filters, setFilters] = React.useState({
    age: null,
    when: null,
    area: null,
    price: null,
    type: null,
    ...(initialFilters || {}),
  });
  const [openMenu, setOpenMenu] = React.useState(null);
  const [hoveredId, setHovered] = React.useState(null);
  const [showExpired, setShowExpired] = React.useState(false);
  const [viewMode, setViewMode] = React.useState("rows"); // 'grid' | 'rows' | 'list' | 'swipe'
  const mapMode = tweaks.mapPlacement; // 'collapsed' | 'left'
  const [showMap, setShowMap] = React.useState(mapMode === "left");
  const [windowWidth, setWindowWidth] = React.useState(typeof window !== "undefined" ? window.innerWidth : 768);
  const [events, setEvents] = React.useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = React.useState(true);
  
  // Fetch events from Supabase (shared with Landing.jsx — see liveEvents.js)
  React.useEffect(() => {
    setIsLoadingEvents(true);
    fetchLiveEvents()
      .then(setEvents)
      .finally(() => setIsLoadingEvents(false));
  }, []);
  
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  React.useEffect(() => {
    setShowMap(mapMode === "left");
  }, [mapMode]);
  
  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;

  const setF = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const anyFilter = Object.values(filters).some(Boolean);
  const clearAll = () =>
    setFilters({ age: null, when: null, area: null, price: null, type: null });

  const match = (e) =>
    (showExpired || e.status !== "expired") &&
    (!filters.age || e.age.includes(filters.age)) &&
    (!filters.when || e.when.includes(filters.when)) &&
    (!filters.area || e.area === filters.area) &&
    (!filters.price ||
      (filters.price === "free"
        ? e.priceType === "free"
        : e.priceType !== "free")) &&
    (!filters.type || e.type === filters.type);
  const filtered = events.filter(match);
  const expiredCount = events.filter((e) => e.status === "expired").length;

  // Deduped lanes: an event shows only in the first row it matches, so the same
  // card never repeats across swim lanes. Render order = claim priority.
  const rowLanes = React.useMemo(() => dedupeLanes(ROWS, 4, [], events), [events]);

  const cardProps = (e) => ({
    onOpen: () => go("detail", e),
    onShare: () => onShare(e),
  });

  // Show loading state while fetching events
  if (isLoadingEvents) {
    return (
      <div
        data-screen-label="02 Browse Loading"
        style={{
          background: "#F5F5F0",
          minHeight: "100vh",
          fontFamily: "Manrope, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              margin: "0 auto 20px",
              border: "4px solid #E5E5E0",
              borderTopColor: "#009B4D",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ fontSize: "16px", color: "#666" }}>Loading events...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-screen-label="02 Browse"
      style={{
        background: "#F5F5F0",
        minHeight: "100vh",
        fontFamily: "Manrope, sans-serif",
        width: "100%",
      }}
    >
      {/* page head */}
      <div style={{ background: "#fff", borderBottom: "1px solid #EEE", width: "100%" }}>
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: isMobile ? "20px 16px 0" : "26px clamp(20px,4vw,40px) 0",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                go("landing");
              }}
              style={{
                color: "#009B4D",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Summer in SG
            </a>
            <span> · Things to do</span>
          </div>
          <h1
            style={{
              fontFamily: '"Feather Bold", serif',
              fontSize: "clamp(28px,3.6vw,38px)",
              color: "#0C3C26",
              margin: "2px 0 4px",
            }}
          >
            Things to do this June
          </h1>
          <div style={{ color: "#666", fontSize: 15, marginBottom: 18 }}>
            {filtered.length} {filtered.length === 1 ? "thing" : "things"} to do
            across Singapore
          </div>

          {/* sticky filter bar */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 25,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 6 : 10,
              flexWrap: "wrap",
              padding: isMobile ? "10px 0" : "12px 0",
              borderTop: "1px solid #F4F4F0",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <FilterDropdown
              label="Age"
              options={FILTERS.age}
              value={filters.age}
              onChange={(v) => setF("age", v)}
              open={openMenu}
              setOpen={setOpenMenu}
            />
            <FilterDropdown
              label="When"
              options={FILTERS.when}
              value={filters.when}
              onChange={(v) => setF("when", v)}
              open={openMenu}
              setOpen={setOpenMenu}
            />
            <FilterDropdown
              label="Area"
              options={FILTERS.area}
              value={filters.area}
              onChange={(v) => setF("area", v)}
              open={openMenu}
              setOpen={setOpenMenu}
            />
            <FilterDropdown
              label="Price"
              options={FILTERS.price}
              value={filters.price}
              onChange={(v) => setF("price", v)}
              open={openMenu}
              setOpen={setOpenMenu}
            />
            <FilterDropdown
              label="Type"
              options={FILTERS.type}
              value={filters.type}
              onChange={(v) => setF("type", v)}
              open={openMenu}
              setOpen={setOpenMenu}
            />
            {/* Map toggle button - positioned after Type filter */}
            {mapMode === "collapsed" && (
              <button
                onClick={() => setShowMap(!showMap)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 42,
                  padding: isMobile ? "0 12px" : "0 14px",
                  borderRadius: 9999,
                  border: showMap ? "1px solid #EEC71B" : "1px solid #DDD",
                  background: showMap ? "#FFF9E5" : "#fff",
                  color: showMap ? "#9B6F00" : "#333",
                  fontFamily: "inherit",
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: showMap ? 700 : 600,
                  cursor: "pointer",
                  transition: "all 150ms",
                  whiteSpace: "nowrap",
                }}
              >
                <MapIcon size={18} strokeWidth={2} />
                {isMobile ? "Map" : (showMap ? "Hide Map" : "Show Map")}
              </button>
            )}
            {anyFilter && (
              <button
                onClick={clearAll}
                style={{
                  height: 42,
                  padding: "0 12px",
                  border: "none",
                  background: "transparent",
                  color: "#009B4D",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Clear all
              </button>
            )}
            <div style={{ flex: 1 }} />
            {/* View mode switcher - hide on mobile when map is shown */}
            <div
              style={{
                display: (isMobile && showMap) ? "none" : "flex",
                gap: 4,
                padding: 4,
                background: "#F5F5F0",
                borderRadius: 10,
              }}
            >
              <button
                onClick={() => setViewMode("rows")}
                style={{
                  padding: isMobile ? "6px 8px" : "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: viewMode === "rows" ? "#fff" : "transparent",
                  color: viewMode === "rows" ? "#0C3C26" : "#666",
                  fontFamily: "inherit",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 150ms",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 3 : 5,
                }}
              >
                <svg
                  width={isMobile ? "14" : "16"}
                  height={isMobile ? "14" : "16"}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="1" y="3" width="14" height="2" rx="0.5" />
                  <rect x="1" y="7" width="14" height="2" rx="0.5" />
                  <rect x="1" y="11" width="14" height="2" rx="0.5" />
                </svg>
                {!isMobile && "Rows"}
              </button>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  padding: isMobile ? "6px 8px" : "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: viewMode === "grid" ? "#fff" : "transparent",
                  color: viewMode === "grid" ? "#0C3C26" : "#666",
                  fontFamily: "inherit",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 150ms",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 3 : 5,
                }}
              >
                <svg
                  width={isMobile ? "14" : "16"}
                  height={isMobile ? "14" : "16"}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="1" y="1" width="6" height="6" rx="0.5" />
                  <rect x="9" y="1" width="6" height="6" rx="0.5" />
                  <rect x="1" y="9" width="6" height="6" rx="0.5" />
                  <rect x="9" y="9" width="6" height="6" rx="0.5" />
                </svg>
                {!isMobile && "Grid"}
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  padding: isMobile ? "6px 8px" : "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: viewMode === "list" ? "#fff" : "transparent",
                  color: viewMode === "list" ? "#0C3C26" : "#666",
                  fontFamily: "inherit",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 150ms",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 3 : 5,
                }}
              >
                <svg
                  width={isMobile ? "14" : "16"}
                  height={isMobile ? "14" : "16"}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect x="1" y="2" width="3" height="3" rx="0.5" />
                  <rect x="5" y="2.5" width="10" height="2" rx="0.5" />
                  <rect x="1" y="6.5" width="3" height="3" rx="0.5" />
                  <rect x="5" y="7" width="10" height="2" rx="0.5" />
                  <rect x="1" y="11" width="3" height="3" rx="0.5" />
                  <rect x="5" y="11.5" width="10" height="2" rx="0.5" />
                </svg>
                {!isMobile && "List"}
              </button>
              <button
                onClick={() => setViewMode("swipe")}
                style={{
                  padding: isMobile ? "6px 8px" : "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  background: viewMode === "swipe" ? "#fff" : "transparent",
                  color: viewMode === "swipe" ? "#0C3C26" : "#666",
                  fontFamily: "inherit",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 150ms",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? 3 : 5,
                }}
              >
                <svg
                  width={isMobile ? "14" : "16"}
                  height={isMobile ? "14" : "16"}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <rect
                    x="3"
                    y="2"
                    width="10"
                    height="12"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect x="5" y="4" width="6" height="1" rx="0.5" />
                </svg>
                {!isMobile && "Swipe"}
              </button>
            </div>
            {expiredCount > 0 && (
              <button
                onClick={() => setShowExpired((s) => !s)}
                title="Show things to do that have ended"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  height: 42,
                  padding: "0 14px",
                  borderRadius: 9999,
                  border: "1px solid " + (showExpired ? "#009B4D" : "#DDD"),
                  background: showExpired ? "#E5F5ED" : "#fff",
                  color: showExpired ? "#0C3C26" : "#555",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    position: "relative",
                    width: 34,
                    height: 20,
                    borderRadius: 9999,
                    background: showExpired ? "#009B4D" : "#CFCFC8",
                    transition: "background 150ms",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: showExpired ? 16 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: 9999,
                      background: "#fff",
                      transition: "left 150ms",
                      boxShadow: "0 1px 3px rgba(0,0,0,.25)",
                    }}
                  />
                </span>
                Show expired
              </button>
            )}
          </div>
        </div>
      </div>

      {/* body */}
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: isMobile ? "20px 16px 40px" : "26px clamp(20px,4vw,40px) 80px",
          width: "100%",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {showMap ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 16 : 24,
              alignItems: "start",
              position: "relative",
              minHeight: isMobile ? "auto" : "calc(100vh - 200px)",
            }}
          >
            <div
              style={{
                position: isMobile ? "relative" : "sticky",
                top: isMobile ? 0 : 70,
                height: isMobile ? "350px" : "calc(100vh - 100px)",
                maxHeight: isMobile ? "350px" : "calc(100vh - 100px)",
                width: "100%",
                marginBottom: isMobile ? 20 : 0,
                order: 0,
                boxSizing: "border-box",
                zIndex: 10,
                alignSelf: "start",
                borderRadius: isMobile ? 18 : 0,
                overflow: "hidden",
              }}
            >
              <MapboxMap
                events={filtered}
                hoveredId={hoveredId}
                setHovered={setHovered}
                onOpen={(e) => go("detail", e)}
                style={{ height: "100%" }}
              />
            </div>
            <div
              style={{
                display: isMobile ? "flex" : "grid",
                flexDirection: isMobile ? "column" : undefined,
                gridTemplateColumns: isMobile 
                  ? undefined 
                  : "repeat(auto-fill, minmax(280px,1fr))",
                gap: isMobile ? 16 : 18,
                width: "100%",
                boxSizing: "border-box",
                minHeight: isMobile ? "auto" : "100vh",
                alignContent: "start",
              }}
            >
              {isMobile ? (
                // Mobile: Use ListCard view
                filtered.map((e) => (
                  <ListCard key={e.id} e={e} {...cardProps(e)} />
                ))
              ) : (
                // Desktop: Use regular EventCard
                filtered.map((e) => (
                  <div
                    key={e.id}
                    onMouseEnter={() => setHovered(e.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      outline:
                        hoveredId === e.id
                          ? "2px solid #009B4D"
                          : "2px solid transparent",
                      borderRadius: 18,
                      transition: "outline-color 140ms",
                    }}
                  >
                    <EventCard e={e} {...cardProps(e)} />
                  </div>
                ))
              )}
              {!filtered.length && <Empty clearAll={clearAll} />}
            </div>
          </div>
        ) : viewMode === "rows" ? (
          anyFilter ? (
            // A filter is active: swim lanes don't apply — show the matching
            // events as a grid (the lanes are an unfiltered browse layout).
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(290px,1fr))",
                  gap: 20,
                }}
              >
                {filtered.map((e) => (
                  <EventCard key={e.id} e={e} {...cardProps(e)} />
                ))}
              </div>
              {!filtered.length && <Empty clearAll={clearAll} />}
            </div>
          ) : (
            <div>
              {rowLanes.map((r) => (
                <Row
                  key={r.key}
                  title={r.title}
                  events={r.events}
                  cardProps={cardProps}
                />
              ))}
            </div>
          )
        ) : viewMode === "list" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Use same order as rows view - deduplicated events from rowLanes if no filters, otherwise use filtered */}
            {anyFilter
              ? filtered.map((e) => (
                  <ListCard key={e.id} e={e} {...cardProps(e)} />
                ))
              : // Deduplicate events since they might appear in multiple rows
                Array.from(
                  new Map(
                    rowLanes.flatMap((r) => r.events).map((e) => [e.id, e]),
                  ).values(),
                ).map((e) => <ListCard key={e.id} e={e} {...cardProps(e)} />)}
            {filtered.length === 0 && anyFilter && (
              <Empty clearAll={clearAll} />
            )}
          </div>
        ) : viewMode === "swipe" ? (
          <div style={{ overflow: "hidden" }}>
            <SwipeView
              events={
                anyFilter
                  ? filtered
                  : Array.from(
                      new Map(
                        rowLanes.flatMap((r) => r.events).map((e) => [e.id, e]),
                      ).values(),
                    )
              }
              cardProps={cardProps}
            />
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px,1fr))",
                gap: 20,
              }}
            >
              {/* Use same order as rows view - deduplicated events from rowLanes if no filters, otherwise use filtered */}
              {anyFilter
                ? filtered.map((e) => (
                    <EventCard key={e.id} e={e} {...cardProps(e)} />
                  ))
                : // Deduplicate events since they might appear in multiple rows
                  Array.from(
                    new Map(
                      rowLanes.flatMap((r) => r.events).map((e) => [e.id, e]),
                    ).values(),
                  ).map((e) => (
                    <EventCard key={e.id} e={e} {...cardProps(e)} />
                  ))}
            </div>
            {filtered.length === 0 && anyFilter && (
              <Empty clearAll={clearAll} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ clearAll }) {
  return (
    <div
      style={{
        gridColumn: "1/-1",
        textAlign: "center",
        padding: "70px 20px",
        color: "#666",
      }}
    >
      <div
        style={{
          fontFamily: '"Feather Bold",serif',
          fontSize: 22,
          color: "#0C3C26",
          marginBottom: 8,
        }}
      >
        Nothing matches just yet
      </div>
      <div style={{ fontSize: 15, marginBottom: 18 }}>
        Try widening your filters to see more of what's on.
      </div>
      <Button variant="outline" onClick={clearAll}>
        Clear all filters
      </Button>
    </div>
  );
}
