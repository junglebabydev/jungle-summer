"use client";

import React from "react";
import { NavWrapper } from "../_components/NavWrapper";
import { Footer } from "../_components/Primitives";

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    userType: "parent",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest("[data-dropdown-container]")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: ["support@jungle.baby", "devs@jungle.baby"],
          subject: `Contact Form: ${formData.userType === "parent" ? "Parent" : formData.userType === "merchant" ? "Partnered Merchant" : "Other"} - ${formData.name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>User Type:</strong> ${formData.userType === "parent" ? "Parent" : formData.userType === "merchant" ? "Partnered Merchant" : "Other"}</p>
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Message:</strong></p>
            <p>${formData.message.replace(/\n/g, "<br>")}</p>
          `,
          text: `New Contact Form Submission\n\nUser Type: ${formData.userType === "parent" ? "Parent" : formData.userType === "merchant" ? "Partnered Merchant" : "Other"}\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({ name: "", email: "", userType: "parent", message: "" });
        setTimeout(() => setIsSuccess(false), 5000); // Hide success message after 5 seconds
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          paddingTop: isMobile ? 0 : 0,
        }}
      >
        {/* Main Content - Side by Side Layout */}
        <div
          style={{
            display: isMobile ? "flex" : "grid",
            flexDirection: isMobile ? "column" : undefined,
            gridTemplateColumns: isMobile ? undefined : "1fr 1fr",
            gap: 0,
            alignItems: "start",
            minHeight: isMobile ? "auto" : "calc(100vh - 100px)",
            width: "100%",
          }}
        >
          {/* Left Side - Hero Image with Text Overlay */}
          <div
            style={{
              position: "relative",
              height: isMobile ? "300px" : "calc(100vh - 100px)",
              overflow: "hidden",
              width: "100%",
            }}
          >
            <img
              src="/contactusImage.jpg"
              alt="Child with yellow telephone"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: isMobile
                  ? "linear-gradient(to bottom, rgba(12, 60, 38, 0.85), rgba(12, 60, 38, 0.7))"
                  : "linear-gradient(to right, rgba(12, 60, 38, 0.8), transparent)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: isMobile ? "24px" : "48px",
              }}
            >
              <h1
                style={{
                  fontFamily: '"Feather Bold", serif',
                  fontSize: isMobile ? "28px" : "clamp(36px, 4vw, 48px)",
                  fontWeight: "bold",
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                Get in touch
              </h1>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  maxWidth: 448,
                  fontSize: isMobile ? 16 : 18,
                  marginBottom: 16,
                }}
              >
                Jungle connects families with the best activities for kids
              </p>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: isMobile ? 13 : 14,
                  maxWidth: 448,
                }}
              >
                Whether you're a parent looking for programs or a provider
                interested in joining our platform, we're here to help.
              </p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div
            style={{
              background: "#fff",
              padding: isMobile ? "32px 20px" : "54px",
              height: isMobile ? "auto" : "100%",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: isMobile ? "flex-start" : "center",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#0C3C26",
                marginBottom: 24,
              }}
            >
              Send us a message
            </h2>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              {/* User Type Dropdown - First Field */}
              <div style={{ position: "relative" }} data-dropdown-container>
                <label
                  htmlFor="userType"
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  I am a *
                </label>
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 15,
                    background: "rgba(249, 250, 251, 0.5)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {formData.userType === "parent"
                      ? "Parent"
                      : formData.userType === "merchant"
                        ? "Partnered Merchant"
                        : "Other"}
                  </span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path
                      d="M1 1.5L6 6.5L11 1.5"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      background: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: 12,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      zIndex: 10,
                      overflow: "hidden",
                    }}
                  >
                    {[
                      { value: "parent", label: "Parent" },
                      { value: "merchant", label: "Partnered Merchant" },
                      { value: "other", label: "Other" },
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            userType: option.value,
                          }));
                          setDropdownOpen(false);
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontSize: 15,
                          color:
                            formData.userType === option.value
                              ? "#009B4D"
                              : "#333",
                          background:
                            formData.userType === option.value
                              ? "#E5F5ED"
                              : "transparent",
                          transition: "background 150ms",
                        }}
                        onMouseEnter={(e) => {
                          if (formData.userType !== option.value) {
                            e.currentTarget.style.background = "#F9FAFB";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (formData.userType !== option.value) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 15,
                    background: "rgba(249, 250, 251, 0.5)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 15,
                    background: "rgba(249, 250, 251, 0.5)",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 4,
                  }}
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Tell us how we can help you..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 15,
                    background: "rgba(249, 250, 251, 0.5)",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  background: "#009B4D",
                  color: "#fff",
                  padding: "12px 24px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: "background-color 300ms",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) =>
                  !isSubmitting &&
                  (e.currentTarget.style.background = "#04722F")
                }
                onMouseLeave={(e) =>
                  !isSubmitting &&
                  (e.currentTarget.style.background = "#009B4D")
                }
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </button>

              {/* Success/Error Messages */}
              {isSuccess && (
                <div
                  style={{
                    padding: 12,
                    background: "#D1FAE5",
                    border: "1px solid #A7F3D0",
                    color: "#065F46",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg
                      style={{
                        width: 16,
                        height: 16,
                        marginRight: 8,
                        color: "#10B981",
                      }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>Thank you! We'll get back to you shortly.</p>
                  </div>
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: 12,
                    background: "#FEE2E2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    borderRadius: 8,
                    fontSize: 14,
                  }}
                >
                  <p>{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
