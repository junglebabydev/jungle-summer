"use client";

import React from "react";
import { NavWrapper } from "../_components/NavWrapper";
import { Footer } from "../_components/Primitives";

const faqs = [
  {
    category: "General Questions",
    questions: [
      {
        question: "What is Jungle all about?",
        answer:
          "Jungle is a platform in Singapore that helps parents discover, explore, and book the best activities for kids aged 0-18 years.",
      },
      {
        question: "What makes Jungle unique compared to other platforms?",
        answer:
          "Jungle offers a comprehensive overview of children's activities in Singapore, with filters for age, location, and activity type. Once you've selected an activity, Jungle's concierge service handles the booking for you.",
      },
      {
        question: "Is Jungle free for parents?",
        answer:
          "Yes, Jungle is completely free for parents to explore and book activities.",
      },
    ],
  },
  {
    category: "Discovering & Booking Activities",
    questions: [
      {
        question: "How can I find activities on Jungle?",
        answer:
          "You can browse activities on our homepage, use the search bar for specific activities, or apply filters based on your child's age, location, and preferences.",
      },
      {
        question: "Are activities sorted by age groups?",
        answer:
          "Yes, each activity is tagged with a suitable age range to help you find options that are perfect for your child.",
      },
      {
        question: "Can I discover free activities on Jungle?",
        answer:
          "Absolutely! Jungle offers a mix of free and paid activities to suit different preferences.",
      },
    ],
  },
  {
    category: "Payments & Refunds",
    questions: [
      {
        question: "How do I pay for activities?",
        answer:
          "Payments are made securely via Paynow once the concierge confirms your booking.",
      },
      {
        question: "Are there any additional fees?",
        answer:
          "No, Jungle doesn't charge parents any extra fees. You only pay the activity provider's listed price.",
      },
      {
        question: "What is the refund policy?",
        answer:
          "Refunds depend on the provider's policy. Check the provider's terms on the activity page or contact the concierge for assistance. Jungle's premium merchant partners offer a full refund for cancellations up to 24 hours before your activity.",
      },
    ],
  },
  {
    category: "Future Features & Roadmap",
    questions: [
      {
        question: "What features can I expect from Jungle in the future?",
        answer:
          "Jungle is working on adding direct booking options, personalized activity recommendations, and a loyalty program for frequent users. We're also planning to introduce family-friendly events, birthday party services, and activity packages.",
      },
    ],
  },
  {
    category: "Support & Feedback",
    questions: [
      {
        question: "How do I contact Jungle for help?",
        answer:
          "You can reach our concierge through the WhatsApp button on the homepage or email us at support@jungle.baby for general inquiries.",
      },
      {
        question: "How can I provide feedback on Jungle?",
        answer:
          "We love hearing from parents! You can provide feedback through our website's feedback form or by emailing support@jungle.baby.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const whatsAppUrl =
    "https://wa.me/6589328429/?text=Hi%2C%20I%20need%20help%20booking%20activities%20for%20my%20child.";

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: "Manrope, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavWrapper />
      <div
        style={{
          maxWidth: 1256,
          margin: "0 auto",
          padding: "14px 20px 32px",
          flexGrow: 1,
        }}
      >
        <div
          style={{
            borderBottom: "1px solid #E5E7EB",
            paddingBottom: 24,
            marginBottom: 48,
          }}
        >
          <h1
            style={{
              fontFamily: '"Feather Bold", serif',
              fontSize: "clamp(28px, 4vw, 36px)",
              color: "#000",
              marginBottom: 8,
            }}
          >
            Frequently Asked Questions
          </h1>
          <p style={{ color: "#666", marginTop: 8, fontSize: 16 }}>
            Find answers to common questions about our services
          </p>
        </div>

        <div>
          {faqs.map((section, sectionIndex) => (
            <div key={sectionIndex} style={{ marginBottom: 64 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 600, color: "#000" }}>
                  {section.category}
                </h2>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {section.questions.map((faq, index) => (
                  <div
                    key={index}
                    style={{
                      borderRadius: 8,
                      border: "1px solid #F3F4F6",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      transition: "box-shadow 300ms",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.boxShadow =
                        "0 4px 6px rgba(0,0,0,0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.1)")
                    }
                  >
                    <button
                      onClick={() => toggleFAQ(`${sectionIndex}-${index}`)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 20,
                        cursor: "pointer",
                        background: "#fff",
                        border: "none",
                        fontFamily: "inherit",
                      }}
                    >
                      <span
                        style={{ fontWeight: 500, fontSize: 16, color: "#000" }}
                      >
                        {faq.question}
                      </span>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background-color 300ms",
                          background:
                            openIndex === `${sectionIndex}-${index}`
                              ? "#0C3C26"
                              : "#F3F4F6",
                        }}
                      >
                        <span
                          style={{
                            color:
                              openIndex === `${sectionIndex}-${index}`
                                ? "#fff"
                                : "#666",
                            transform:
                              openIndex === `${sectionIndex}-${index}`
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            transition: "transform 300ms",
                            display: "inline-block",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </button>
                    <div
                      style={{
                        maxHeight:
                          openIndex === `${sectionIndex}-${index}`
                            ? "300px"
                            : "0",
                        opacity:
                          openIndex === `${sectionIndex}-${index}` ? 1 : 0,
                        transition: "all 300ms ease-in-out",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "0 20px 20px",
                          background: "rgba(249, 250, 251, 0.5)",
                          borderTop: "1px solid #F3F4F6",
                        }}
                      >
                        <p
                          style={{
                            color: "#666",
                            marginTop: 12,
                            lineHeight: 1.6,
                          }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Help Section */}
          <div
            style={{
              marginTop: 64,
              padding: 32,
              background: "rgba(12, 60, 38, 0.05)",
              borderRadius: 12,
              border: "1px solid rgba(12, 60, 38, 0.1)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: "rgba(12, 60, 38, 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
              }}
            >
              💬
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#000",
                marginBottom: 12,
              }}
            >
              Still need help?
            </h2>
            <p
              style={{
                color: "#666",
                marginTop: 12,
                maxWidth: 448,
                margin: "12px auto 24px",
                lineHeight: 1.6,
              }}
            >
              Contact our support team for personalized assistance with any
              questions you may have
            </p>
            <button
              onClick={handleWhatsAppClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 32px",
                background: "#009B4D",
                color: "#fff",
                borderRadius: 9999,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                fontWeight: 500,
                minWidth: 200,
                justifyContent: "center",
                cursor: "pointer",
                border: "none",
                fontSize: 15,
                fontFamily: "inherit",
                transition: "all 300ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#04722F";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#009B4D";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
            >
              <span style={{ marginRight: 8 }}>💬</span> Contact via WhatsApp
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
