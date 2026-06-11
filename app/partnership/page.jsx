'use client';

import React from 'react';
import { NavWrapper } from '../_components/NavWrapper';
import { Footer } from '../_components/Primitives';

const communities = [
  {
    name: "Expat Dads (Singapore)",
    members: "WhatsApp Community",
    description:
      "A supportive WhatsApp community just for dads and dads-to-be living in Singapore. From sleepless nights to funny toddler stories, this group offers a safe, judgment-free space to connect, share, and be real about fatherhood.",
    link: "https://chat.whatsapp.com/DHR0qrFtwsrGClUhsWCnPj",
    linkText: "Join the Expat Dads WhatsApp Group",
    note: "(Admin-approved group. Men only.)",
    icon: "👨‍👦",
    image: "/expatdads.jpg",
  },
  {
    name: "BumpWise",
    members: "Facebook Community",
    description:
      "Run by two of Singapore's most experienced doulas, Deanna Kearns and Johanna Wagner, BumpWise is a warm, respectful Facebook community for new and expectant parents. With thousands of members, it's a go-to space for trusted advice, support, and sharing the parenting ride.",
    link: "https://www.facebook.com/groups/927276051024942",
    linkText: "Join the BumpWise Facebook Group",
    secondLink: "https://bumpwise.services-link-here",
    secondLinkText: "Explore BumpWise Services",
    icon: "👶",
    image: "/bumpwise.jpg",
  },
];

const influencers = [
  {
    name: "Jason Papaya",
    handle: "@jasonpapaya",
    description:
      "A proud dad, funny guy, and all-around great follow. Jason brings heart and humour to parenting life in Singapore — from honest takes on toddler tantrums to clever family hacks. Bonus: He's got serious taste in food.",
    link: "https://www.instagram.com/jasonpapaya/",
    linkText: "Follow Jason on Instagram",
    icon: "👨",
    image: "/jason.jpg",
  },
  {
    name: "Boays On The Loose",
    handle: "@boaysontheloose",
    description:
      "Two brothers, one playful dad, and lots of chaos. This account captures the beautiful mess of fatherhood through charming clips, thoughtful posts, and plenty of fun around Singapore. Great ideas for kid-friendly spots too!",
    link: "https://www.instagram.com/boaysontheloose/",
    linkText: "Follow Boays on Instagram",
    icon: "👨‍👦‍👦",
    image: "/boaysonloose.jpg",
  },
];

export default function PartnershipPage() {
  const [activeTab, setActiveTab] = React.useState("Communities We Love");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [formData, setFormData] = React.useState({
    businessName: "",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",
    activity: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{8,}$/.test(formData.phone.replace(/\s+/g, ""))) {
      newErrors.phone = "Please enter a valid phone number (minimum 8 digits)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.activity.trim()) {
      newErrors.activity = "Please tell us about your activity";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        businessName: formData.businessName,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phone,
        email: formData.email,
        website: formData.website,
        activityDescription: formData.activity,
      };

      const response = await fetch(
        "https://junglebabynode--junglesg-production.asia-east1.hosted.app/send-partnership-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (data.success === true) {
        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
          setFormData({
            businessName: "",
            contactPerson: "",
            phone: "",
            email: "",
            website: "",
            activity: "",
          });
        }, 5000);
      } else {
        console.error("Partnership request failed:", data);
      }
    } catch (error) {
      console.error("Error submitting partnership request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayContent = () => {
    if (activeTab === "Communities We Love") {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {communities.map((community, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div
                style={{
                  height: 240,
                  backgroundImage: `url('${community.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontWeight: 600, fontSize: 18, color: '#1F2937' }}>
                  {community.name}
                </h3>
                <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                  {community.members}
                </p>
                <p style={{ fontSize: 14, color: '#4B5563', flexGrow: 1, marginBottom: 20 }}>
                  {community.description}
                </p>
                <a
                  href={community.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#10B981',
                    color: '#fff',
                    textAlign: 'center',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'background 300ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                  onMouseLeave={e => e.currentTarget.style.background = '#10B981'}
                >
                  Join now
                </a>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#0C3C26', marginBottom: 24 }}>
            Our Favourite Parent Follows
          </h2>
          <p style={{ color: '#4B5563', marginBottom: 32 }}>
            Parenting in Singapore can feel like a wild ride — and these
            creators keep it real. We work with local voices who inspire us,
            make us laugh, and share genuinely useful tips about family life. If
            you're not already following them, now's the time.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {influencers.map((influencer, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    height: 240,
                    backgroundImage: `url('${influencer.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 18, color: '#1F2937' }}>
                    {influencer.name}
                  </h3>
                  <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                    {influencer.handle}
                  </p>
                  <p style={{ fontSize: 14, color: '#4B5563', flexGrow: 1, marginBottom: 20 }}>
                    {influencer.description}
                  </p>
                  <a
                    href={influencer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#10B981',
                      color: '#fff',
                      textAlign: 'center',
                      borderRadius: 6,
                      textDecoration: 'none',
                      fontWeight: 500,
                      transition: 'background 300ms'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                    onMouseLeave={e => e.currentTarget.style.background = '#10B981'}
                  >
                    Follow
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Manrope, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavWrapper />
      {/* Hero Section */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          backgroundImage: "url('/partnershipImg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 450,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.25)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1256, margin: '0 auto', padding: '0 16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ maxWidth: 576 }}>
            <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 'bold', marginBottom: 12, color: '#fff' }}>
              Want to partner<br />with Jungle?
            </h1>
            <p style={{ color: '#fff', fontSize: 18 }}>
              If you run a parenting community, offer support for families, or
              create helpful, fun content for mums and dads in Singapore — we'd
              love to hear from you.
            </p>
            <button
              onClick={() =>
                document
                  .getElementById("contact-section")
                  .scrollIntoView({ behavior: "smooth" })
              }
              style={{
                marginTop: 24,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '10px 28px',
                background: '#fff',
                color: '#047857',
                fontWeight: 500,
                borderRadius: 9999,
                transition: 'opacity 300ms',
                fontSize: 14,
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Reach out to us
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1256, margin: '0 auto', padding: '48px 16px', flexGrow: 1 }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#0C3C26' }}>
            Communities and Influencers
          </h2>
          <p style={{ color: '#4B5563' }}>
            We work with local voices who inspire us, make us laugh, and share
            genuinely useful parenting tips.
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search"
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                fontSize: 15,
                fontFamily: 'inherit'
              }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            <button
              onClick={() => setActiveTab("Communities We Love")}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 14,
                background: activeTab === "Communities We Love" ? '#D1FAE5' : '#F3F4F6',
                color: activeTab === "Communities We Love" ? '#047857' : '#1F2937',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap'
              }}
            >
              Communities We Love
            </button>
            <button
              onClick={() => setActiveTab("Our Favourite Influencers")}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                fontSize: 14,
                background: activeTab === "Our Favourite Influencers" ? '#D1FAE5' : '#F3F4F6',
                color: activeTab === "Our Favourite Influencers" ? '#047857' : '#1F2937',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap'
              }}
            >
              Our Favourite Influencers
            </button>
          </div>
        </div>

        {/* Display Communities or Influencers based on selected tab */}
        {displayContent()}

        {/* Contact Form */}
        <div id="contact-section" style={{ marginTop: 80 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#000', marginBottom: 24 }}>Contact us</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  Business Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="What is your business name?"
                  style={{
                    marginTop: 4,
                    display: 'block',
                    width: '100%',
                    padding: 12,
                    border: errors.businessName ? '1px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'inherit'
                  }}
                />
                {errors.businessName && (
                  <p style={{ marginTop: 4, fontSize: 14, color: '#EF4444' }}>
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="What is your name?"
                  style={{
                    marginTop: 4,
                    display: 'block',
                    width: '100%',
                    padding: 12,
                    border: errors.contactPerson ? '1px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'inherit'
                  }}
                />
                {errors.contactPerson && (
                  <p style={{ marginTop: 4, fontSize: 14, color: '#EF4444' }}>
                    {errors.contactPerson}
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="What is your mobile number?"
                  style={{
                    marginTop: 4,
                    display: 'block',
                    width: '100%',
                    padding: 12,
                    border: errors.phone ? '1px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{ marginTop: 4, fontSize: 14, color: '#6B7280' }}>
                  Please include your country code (e.g., +65 for Singapore)
                </p>
                {errors.phone && (
                  <p style={{ marginTop: 4, fontSize: 14, color: '#EF4444' }}>{errors.phone}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="What is your email?"
                  style={{
                    marginTop: 4,
                    display: 'block',
                    width: '100%',
                    padding: 12,
                    border: errors.email ? '1px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'inherit'
                  }}
                />
                {errors.email && (
                  <p style={{ marginTop: 4, fontSize: 14, color: '#EF4444' }}>{errors.email}</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  Website / Instagram
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Write your website or Instagram link"
                  style={{
                    marginTop: 4,
                    display: 'block',
                    width: '100%',
                    padding: 12,
                    border: '1px solid #D1D5DB',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151' }}>
                  Tell us about your activity
                </label>
                <textarea
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  placeholder="Write notes here..."
                  rows={4}
                  style={{
                    marginTop: 4,
                    display: 'block',
                    width: '100%',
                    padding: 12,
                    border: errors.activity ? '1px solid #EF4444' : '1px solid #D1D5DB',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'inherit'
                  }}
                />
                {errors.activity && (
                  <p style={{ marginTop: 4, fontSize: 14, color: '#EF4444' }}>{errors.activity}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: 120,
                    padding: '12px',
                    background: '#10B981',
                    color: '#fff',
                    fontWeight: 500,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'background 300ms',
                    border: 'none',
                    fontSize: 15,
                    fontFamily: 'inherit'
                  }}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.background = '#059669')}
                  onMouseLeave={e => !isLoading && (e.currentTarget.style.background = '#10B981')}
                >
                  {isLoading ? (
                    <>Sending...</>
                  ) : isSuccess ? (
                    <>✓ Sent!</>
                  ) : (
                    "Let's Chat"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Success Message */}
          {isSuccess && (
            <div style={{
              marginTop: 16,
              padding: 16,
              background: '#D1FAE5',
              border: '1px solid #A7F3D0',
              color: '#047857',
              borderRadius: 8,
              transition: 'all 300ms'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg
                  style={{ width: 20, height: 20, marginRight: 8, color: '#10B981' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>
                  Thank you for reaching out! We'll get back to you shortly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}