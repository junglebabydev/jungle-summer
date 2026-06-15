// ============================================================
// Primitives — icons + shared controls for Summer in SG
// ============================================================
import React, { useState, useEffect, useRef } from "react";

// ---- Icons (Lucide-style, 2px stroke, currentColor) ----
export const Ico = {
  search: (s = 20) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  pin: (s = 16) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s-8-7.5-8-13a8 8 0 1 1 16 0c0 5.5-8 13-8 13z" />
      <circle cx="12" cy="9" r="3" />
    </svg>
  ),
  heart: (s = 18, filled = false) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill={filled ? "#F63F3C" : "none"}
      stroke={filled ? "#F63F3C" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ),
  share: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
    </svg>
  ),
  star: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3 7 7.5.6-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5L9 9z" />
    </svg>
  ),
  chev: (s = 18, dir = "right") => {
    const r = { right: 0, left: 180, down: 90, up: -90 }[dir];
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: `rotate(${r}deg)` }}
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    );
  },
  mail: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  phone: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18h2" />
    </svg>
  ),
  link: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  ),
  x: (s = 20) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  cal: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  ),
  map: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" />
      <path d="M9 3v16M15 5v16" />
    </svg>
  ),
  arrowL: (s = 20) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  check: (s = 16) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  grid: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  tiles: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="7" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
    </svg>
  ),
  photos: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.8" />
      <path d="m21 16-5-5L5 21" />
    </svg>
  ),
  sun: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  clock: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  repeat: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  ticket: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 0 0-4z" />
      <path d="M13 6v12" strokeDasharray="2 3" />
    </svg>
  ),
  globe: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </svg>
  ),
  external: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h6v6M21 3l-9 9" />
      <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
    </svg>
  ),
  plus: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  help: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 3M12 17h.01" />
    </svg>
  ),
  instagram: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="m17.5 6.5h.01" />
    </svg>
  ),
  facebook: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  shield: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2 3 7v8c0 3 2 6 9 10 7-4 9-7 9-10V7z" />
    </svg>
  ),
  users: (s = 18) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
  className = "",
  style = {},
}) {
  const base = {
    border: "none",
    cursor: "pointer",
    fontFamily: "Manrope, sans-serif",
    fontWeight: 600,
    fontSize: size === "sm" ? 14 : 16,
    borderRadius: 9999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 200ms ease",
    whiteSpace: "nowrap",
    boxSizing: "border-box",
  };
  const sizes = {
    sm: { height: 40, padding: "0 18px" },
    md: { height: 50, padding: "0 26px" },
    lg: { height: 56, padding: "0 32px", fontSize: 17 },
  };
  const variants = {
    primary: { background: "#009B4D", color: "#fff" },
    outline: {
      background: "transparent",
      color: "#009B4D",
      border: "2px solid #009B4D",
    },
    dark: { background: "#0C3C26", color: "#fff" },
    ghost: {
      background: "#fff",
      color: "#0C3C26",
      border: "1px solid #DDDDDD",
    },
  };
  const hover = {
    primary: (e, on) =>
      (e.currentTarget.style.background = on ? "#04722F" : "#009B4D"),
    outline: (e, on) => {
      e.currentTarget.style.background = on ? "#009B4D" : "transparent";
      e.currentTarget.style.color = on ? "#fff" : "#009B4D";
    },
    dark: (e, on) =>
      (e.currentTarget.style.background = on ? "#0a3220" : "#0C3C26"),
    ghost: (e, on) =>
      (e.currentTarget.style.background = on ? "#F5F5F0" : "#fff"),
  }[variant];
  return (
    <button
      onClick={onClick}
      className={className}
      onMouseEnter={(e) => hover && hover(e, true)}
      onMouseLeave={(e) => hover && hover(e, false)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

export function Chip({ active, children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#E5F5ED" : "#fff",
        border: "1px solid " + (active ? "#009B4D" : "#DDDDDD"),
        color: active ? "#0C3C26" : "#333",
        borderRadius: 9999,
        padding: "8px 15px",
        fontSize: 13.5,
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        fontFamily: "Manrope, sans-serif",
        whiteSpace: "nowrap",
        transition: "all 160ms ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// little category/meta pill used on cards & detail
export function MetaPill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#F5F5F0", fg: "#333", bd: "#EAEAEA" },
    green: { bg: "#E5F5ED", fg: "#0C3C26", bd: "#CDEBD9" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: tones.bg,
        color: tones.fg,
        border: `1px solid ${tones.bd}`,
        borderRadius: 9999,
        padding: "5px 11px",
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: "Manrope, sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function TopBanner({ go }) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      style={{
        minHeight: 44,
        background: "#E5F5ED",
        color: "#0C3C26",
        fontSize: isMobile ? 12 : 13,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? 8 : 12,
        fontFamily: "Manrope, sans-serif",
        padding: isMobile ? "8px 12px" : "0 20px",
        flexWrap: isMobile ? "wrap" : "nowrap",
        textAlign: isMobile ? "center" : "left",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span style={{ color: "#009B4D" }}>{Ico.sun(15)}</span>
        {isMobile
          ? "School holidays are here."
          : "School holidays are here. Dozens of things on in June."}
      </span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          go("browse");
        }}
        style={{
          color: "#009B4D",
          fontWeight: 700,
          textDecoration: "underline",
        }}
      >
        Browse things to do →
      </a>
    </div>
  );
}

export function Nav({ go, theme }) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  React.useEffect(() => {
    if (menuOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, isMobile]);

  // theme null => solid white nav (browse/detail). Otherwise transparent over hero.
  const t = theme || {};
  const transparent = !!theme;
  const fg = t.fg || "#0C3C26";
  const dark = t.fgIsDark; // text is dark green (yellow hero) -> use deep pills
  const logoSrc =
    transparent && !t.logoColor
      ? "/assets/brand/logo-monochrome-light.png"
      : "/assets/brand/logo-color-primary.png";
  const pillBg = !transparent
    ? "#E5F5ED"
    : dark
      ? "rgba(12,60,38,.10)"
      : "rgba(255,255,255,.18)";
  const pillBd = !transparent
    ? "#CDEBD9"
    : dark
      ? "rgba(12,60,38,.25)"
      : "rgba(255,255,255,.45)";

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          height: 60,
          background: transparent ? "transparent" : "#fff",
          borderBottom: transparent ? "none" : "1px solid #E5E7EB",
          fontFamily: "Manrope, sans-serif",
        }}
        data-comment-anchor="06a71433c1-div-77-11"
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: isMobile ? "0 20px" : "0 clamp(20px,4vw,40px)",
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: isMobile ? 12 : 40,
          }}
        >
          <div
            onClick={() => go("landing")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img
              src={transparent ? "/assets/brand/logo-white.png" : "/assets/brand/logo.png"}
              style={{ height: isMobile ? 28 : 26 }}
              alt="Jungle"
            />
          </div>

          {!isMobile ? (
            <>
              <nav
                style={{
                  display: "flex",
                  gap: 40,
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {[
                  ["Explore", "https://jungle.baby"],
                  ["Summer", "landing"],
                  ["Contact", "contact"],
                ].map(([l, route]) => (
                  <a
                    key={l}
                    onClick={(e) => {
                      e.preventDefault();
                      if (route.startsWith('http')) {
                        window.location.href = route;
                      } else if (route === 'contact') {
                        window.location.href = '/contact';
                      } else if (route) {
                        go(route);
                      }
                    }}
                    href={route.startsWith('http') ? route : route === 'contact' ? '/contact' : '#'}
                    style={{
                      color: transparent ? fg : "#374151",
                      textDecoration: "none",
                      transition: "color 200ms",
                    }}
                    onMouseEnter={(e) => {
                      if (!transparent) e.currentTarget.style.color = "#0C3C26";
                    }}
                    onMouseLeave={(e) => {
                      if (!transparent) e.currentTarget.style.color = "#374151";
                    }}
                  >
                    {l}
                  </a>
                ))}
              </nav>
              <div style={{ flex: 1 }} />
            </>
          ) : (
            <>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "flex-end",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 2,
                    background: fg,
                    borderRadius: 1,
                    transition: "all 200ms",
                  }}
                />
                <span
                  style={{
                    width: menuOpen ? 24 : 18,
                    height: 2,
                    background: fg,
                    borderRadius: 1,
                    transition: "all 200ms",
                  }}
                />
                <span
                  style={{
                    width: menuOpen ? 24 : 14,
                    height: 2,
                    background: fg,
                    borderRadius: 1,
                    transition: "all 200ms",
                  }}
                />
              </button>
            </>
          )}
        </div>
      </div>

      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#fff",
            overflowY: "auto",
            zIndex: 29,
            fontFamily: "Manrope, sans-serif",
            paddingTop: "40px",
          }}
        >
          {[
            ["Explore", "https://jungle.baby"],
            ["Summer", "landing"],
            ["Contact", "contact"],
          ].map(([l, route], index) => (
            <a
              key={l}
              onClick={(e) => {
                e.preventDefault();
                if (route.startsWith('http')) {
                  window.location.href = route;
                } else if (route === 'contact') {
                  window.location.href = '/contact';
                } else if (route) {
                  go(route);
                }
                setMenuOpen(false);
              }}
              href={route === 'contact' ? '/contact' : '#'}
              style={{
                display: "block",
                padding: "14px 24px",
                color: "#0C3C26",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                borderTop: index === 0 ? "none" : "1px solid #F5F5F0",
              }}
            >
              {l}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export function Footer({ go }) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <footer
      style={{
        background: "#0C3C26",
        color: "#E5F5ED",
        padding: isMobile ? "40px 20px 24px" : "56px clamp(20px,4vw,48px) 32px",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr 1fr 1fr 1fr",
          gap: isMobile ? 32 : 40,
          maxWidth: 1256,
          margin: "0 auto",
        }}
      >
        <div>
          <img
            src="/assets/brand/logo-monochrome-light.png"
            style={{ height: isMobile ? 36 : 42, marginBottom: 16 }}
            alt="Jungle"
          />
          <p
            style={{
              fontSize: 14,
              opacity: 0.8,
              maxWidth: isMobile ? "100%" : 280,
              lineHeight: 1.6,
            }}
          >
            Singapore's guide to kids' activities, camps and things to do. Made
            for parents, by parents.
          </p>
        </div>

        {/* About Jungle */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 14,
              color: "#fff",
            }}
          >
            About Jungle
          </div>
          {["FAQ", "Contact", "Partnership", "Our Story"].map((item) => (
            <a
              key={item}
              href={
                item === "FAQ"
                  ? "/faq"
                  : item === "Contact"
                    ? "/contact"
                    : item === "Partnership"
                      ? "/partnership"
                      : item === "Our Story"
                        ? "/about"
                        : "#"
              }
              style={{
                display: "block",
                fontSize: 14,
                marginBottom: 10,
                opacity: 0.75,
                color: "#E5F5ED",
                textDecoration: "none",
              }}
            >
              {item}
            </a>
          ))}
          <a
            href="https://www.jungle.baby/blogs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 10,
              opacity: 0.75,
              color: "#E5F5ED",
              textDecoration: "none",
            }}
          >
            Blogs
          </a>
        </div>

        {/* Resources */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 14,
              color: "#fff",
            }}
          >
            Resources
          </div>
          <a
            href="https://partner.jungle.baby"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 10,
              opacity: 0.75,
              color: "#E5F5ED",
              textDecoration: "none",
            }}
          >
            List your business
          </a>
          <a
            href="https://www.jungle.baby/merchant-blogs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 10,
              opacity: 0.75,
              color: "#E5F5ED",
              textDecoration: "none",
            }}
          >
            Blogs
          </a>
          <a
            href="https://www.jungle.baby/merchant-templates"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 10,
              opacity: 0.75,
              color: "#E5F5ED",
              textDecoration: "none",
            }}
          >
            Templates
          </a>
        </div>

        {/* Legal */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 14,
              color: "#fff",
            }}
          >
            Legal
          </div>
          {["Privacy Policy", "Terms of Use", "Refund & Cancellation"].map(
            (item) => (
              <a
                key={item}
                href={
                  item === "Privacy Policy"
                    ? "/privacy-policy"
                    : item === "Terms of Use"
                      ? "/terms-of-use"
                      : item === "Refund & Cancellation"
                        ? "/refund-and-cancellation-policy"
                        : "#"
                }
                style={{
                  display: "block",
                  fontSize: 14,
                  marginBottom: 10,
                  opacity: 0.75,
                  color: "#E5F5ED",
                  textDecoration: "none",
                }}
              >
                {item}
              </a>
            ),
          )}
        </div>

        {/* Follow Us */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".08em",
              marginBottom: 14,
              color: "#fff",
            }}
          >
            Follow Us
          </div>
          <a
            href="https://www.facebook.com/people/Jungle-Singapore/61575557901389/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 10,
              opacity: 0.75,
              color: "#E5F5ED",
              textDecoration: "none",
            }}
          >
            Facebook
          </a>
          <a
            href="https://www.instagram.com/explorejunglesg/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 10,
              opacity: 0.75,
              color: "#E5F5ED",
              textDecoration: "none",
            }}
          >
            Instagram
          </a>
          <a
            href="https://discord.gg/CvEfzHbTGA"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 10,
              opacity: 0.75,
              color: "#E5F5ED",
              textDecoration: "none",
            }}
          >
            Discord
          </a>
          <a
            href="https://www.linkedin.com/company/junglebaby/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              fontSize: 14,
              marginBottom: 10,
              opacity: 0.75,
              color: "#E5F5ED",
              textDecoration: "none",
            }}
          >
            LinkedIn
          </a>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,.12)",
          paddingTop: 20,
          display: isMobile ? "block" : "flex",
          justifyContent: "space-between",
          fontSize: 12,
          opacity: 0.6,
          maxWidth: 1256,
          margin: isMobile ? "32px auto 0" : "44px auto 0",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        <span style={{ display: "block", marginBottom: isMobile ? 8 : 0 }}>
          © 2025 Jungle. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
