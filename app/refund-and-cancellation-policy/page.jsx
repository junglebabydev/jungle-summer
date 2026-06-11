'use client';

import React from 'react';
import { NavWrapper } from '../_components/NavWrapper';
import { Footer } from '../_components/Primitives';

export default function RefundCancellationPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Manrope, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavWrapper />
      <div style={{ maxWidth: 1256, margin: '0 auto', padding: '84px 20px 32px', flexGrow: 1 }}>
        <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: 24, marginBottom: 40 }}>
          <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 36, fontWeight: 'bold', color: '#000' }}>
            Refund & Cancellation Policy
          </h1>
        </div>

        <div style={{ fontSize: 16, color: '#374151', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 16 }}>
            At Jungle, we aim to provide a hassle-free booking experience while ensuring fairness for both parents and activity providers. Please review the cancellation and refund terms below.
          </p>
          
          <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
            Cancellation by Merchant
          </h2>
          <p style={{ marginBottom: 16 }}>
            If an activity is canceled by the provider, we will notify you promptly and offer a full refund or the option to reschedule. If you haven't received a notification, please contact support@jungle.baby.
          </p>
          
          <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
            Customer Cancellations
          </h2>
          <p style={{ marginBottom: 16 }}>
            Each activity has its own cancellation policy. Please check your booking confirmation or the activity page for details.
          </p>
          <p style={{ marginBottom: 16 }}>If the activity allows free cancellation:</p>
          
          <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            You can cancel your booking within the allowed period via email
          </h3>
          <p style={{ marginBottom: 16 }}>
            You can cancel your booking within the allowed period by sending us an email at support@jungle.baby mentioning the booking ID and date.
          </p>
          <p style={{ marginBottom: 16 }}>Once canceled, your tickets will no longer be valid for use.</p>
          
          <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 24, marginBottom: 8 }}>
            If the activity has a no-cancellation policy:
          </h3>
          <p style={{ marginBottom: 16 }}>
            Some activities are non-refundable once booked. If you cannot attend, we recommend contacting the provider as they may allow rescheduling at their discretion.
          </p>
          
          <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
            Exceptional Circumstances Refund:
          </h2>
          <p style={{ marginBottom: 16 }}>
            If you need to cancel within the penalty period due to unforeseen emergencies, you may be eligible for a refund. These include:
          </p>
          <p style={{ marginBottom: 16 }}>
            Compassionate reasons: Passing of a first-degree relative (proof required).
          </p>
          <p style={{ marginBottom: 16 }}>
            Force Majeure: Natural disasters, severe weather, government restrictions, or unforeseen events that make the activity impossible to proceed (official proof required).
          </p>
          <p style={{ marginBottom: 16 }}>
            Transport Disruption: Involuntary flight, train, or ferry cancellations outside of your control (proof required).
          </p>
          <p style={{ marginBottom: 16 }}>
            If accepted, refunds (except for compassionate reasons) will be issued in the form of a Jungle promo code.
          </p>
          
          <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>
            Latecomers & No-Shows
          </h2>
          <p style={{ marginBottom: 16 }}>
            For flexible date activities: If your activity allows, you may still use your voucher on another date within the validity period.
          </p>
          <p style={{ marginBottom: 16 }}>
            For fixed date bookings: No refunds will be provided for late arrivals or no-shows.
          </p>
          <p style={{ marginBottom: 16 }}>
            In case of emergencies (e.g., illness, travel issues), please contact Jungle Support as soon as possible. We will do our best to assist you.
          </p>
          
          <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 32, marginBottom: 16 }}>Need Help?</h2>
          <p style={{ marginBottom: 16 }}>
            If you have any refund-related inquiries, reach out to support@jungle.baby with:
          </p>
          <p style={{ marginBottom: 16 }}>Full name (as per booking)</p>
          <p style={{ marginBottom: 16 }}>Booking Reference ID</p>
          <p style={{ marginBottom: 16 }}>Activity name</p>
          <p style={{ marginBottom: 16 }}>Relevant supporting documents (if applicable)</p>
          <p style={{ marginBottom: 16 }}>
            We're here to help and will always work towards the best possible solution for you.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}