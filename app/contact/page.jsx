'use client';

import React from 'react';
import { NavWrapper } from '../_components/NavWrapper';
import { Footer } from '../_components/Primitives';

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
      const response = await fetch(
        "https://junglebabynode--junglesg-production.asia-east1.hosted.app/send-connection-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userType: formData.userType,
            email: formData.email,
            name: formData.name,
            message: formData.message,
          }),
        }
      );

      const data = await response.json();

      if (data.success === true) {
        setIsSuccess(true);
        setFormData({ name: "", email: "", userType: "parent", message: "" });
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
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Manrope, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavWrapper />
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, paddingTop: 64 }}>
        {/* Main Content - Side by Side Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, alignItems: 'start', minHeight: 'calc(100vh - 100px)' }}>
          {/* Left Side - Hero Image with Text Overlay */}
          <div style={{ position: 'relative', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            <img
              src="/contactusImage.jpg"
              alt="Child with yellow telephone"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(12, 60, 38, 0.8), transparent)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '48px'
            }}>
              <h1 style={{
                fontFamily: '"Feather Bold", serif',
                fontSize: 'clamp(36px, 4vw, 48px)',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: 16
              }}>
                Get in touch
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: 448, fontSize: 18, marginBottom: 16 }}>
                Jungle connects families with the best activities for kids
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, maxWidth: 448 }}>
                Whether you're a parent looking for programs or a provider
                interested in joining our platform, we're here to help.
              </p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div style={{
            background: '#fff',
            padding: '64px',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C3C26', marginBottom: 24 }}>
              Send us a message
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* User Type Dropdown - First Field */}
              <div>
                <label htmlFor="userType" style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 4
                }}>
                  I am a *
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 15,
                    background: 'rgba(249, 250, 251, 0.5)',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23009B4D%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.7rem top 50%',
                    backgroundSize: '0.65rem auto',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="parent">Parent</option>
                  <option value="merchant">Partnered Merchant</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 4
                }}>
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
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 15,
                    background: 'rgba(249, 250, 251, 0.5)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 4
                }}>
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
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 15,
                    background: 'rgba(249, 250, 251, 0.5)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" style={{
                  display: 'block',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 4
                }}>
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
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    fontSize: 15,
                    background: 'rgba(249, 250, 251, 0.5)',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: '#009B4D',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                  transition: 'background-color 300ms',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={e => !isSubmitting && (e.currentTarget.style.background = '#04722F')}
                onMouseLeave={e => !isSubmitting && (e.currentTarget.style.background = '#009B4D')}
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </button>

              {/* Success/Error Messages */}
              {isSuccess && (
                <div style={{
                  padding: 12,
                  background: '#D1FAE5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  borderRadius: 8,
                  fontSize: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg
                      style={{ width: 16, height: 16, marginRight: 8, color: '#10B981' }}
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
                <div style={{
                  padding: 12,
                  background: '#FEE2E2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  borderRadius: 8,
                  fontSize: 14
                }}>
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