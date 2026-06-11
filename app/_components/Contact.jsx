// ============================================================
// Contact — Contact information page
// ============================================================
import React from "react";
import { Ico } from "./Primitives.jsx";

export function Contact() {
  return (
    <div
      style={{
        background: "#fff",
        minHeight: "calc(100vh - 400px)",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "60px clamp(20px,4vw,48px) 80px",
        }}
      >
        <h1
          style={{
            fontFamily: '"Feather Bold", serif',
            fontSize: "clamp(36px,5vw,48px)",
            color: "#0C3C26",
            marginBottom: 12,
            lineHeight: 1.1,
          }}
        >
          Get in touch
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "#666",
            marginBottom: 48,
            maxWidth: 600,
            lineHeight: 1.6,
          }}
        >
          Have questions about summer activities? Looking to list your programs?
          We're here to help make summer in Singapore amazing for families.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 32,
            marginBottom: 60,
          }}
        >
          {/* Support */}
          <div style={{ padding: 28, background: "#F5F5F0", borderRadius: 20 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#E5F5ED",
                color: "#009B4D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {Ico.help(24)}
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#0C3C26",
                marginBottom: 8,
              }}
            >
              Support
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              Need help with bookings or have technical issues?
            </p>
            <a
              href="mailto:support@jungle.baby"
              style={{
                color: "#009B4D",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              support@jungle.baby
            </a>
          </div>
        </div>

        {/* Office Location */}

        {/* Quick Contact Form */}
      </div>
    </div>
  );
}
