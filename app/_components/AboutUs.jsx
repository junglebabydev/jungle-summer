// ============================================================
// AboutUs — About Jungle page
// ============================================================
import React from 'react';
import { Ico } from './Primitives.jsx';

export function AboutUs() {
  return (
    <div style={{ background: '#fff', minHeight: 'calc(100vh - 400px)', fontFamily: 'Manrope, sans-serif' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px clamp(20px,4vw,48px) 80px' }}>
        {/* Hero Section */}
        <div style={{ marginBottom: 60 }}>
          <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 'clamp(36px,5vw,48px)', color: '#0C3C26', marginBottom: 20, lineHeight: 1.1 }}>
            Making summer magic happen for Singapore families
          </h1>
          <p style={{ fontSize: 18, color: '#666', maxWidth: 700, lineHeight: 1.7 }}>
            Jungle is Singapore's trusted guide to kids' activities, camps, and things to do. We help parents discover amazing experiences that create lasting memories.
          </p>
        </div>

        {/* Mission Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60 }}>
          <div style={{ padding: 32, background: '#E5F5ED', borderRadius: 20 }}>
            <h2 style={{ fontFamily: '"Feather Bold", serif', fontSize: 28, color: '#0C3C26', marginBottom: 16 }}>Our Mission</h2>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7 }}>
              To make it easy for parents to find quality activities that enrich their children's lives. We believe every child deserves access to experiences that spark joy, build confidence, and create lifelong memories.
            </p>
          </div>
          <div style={{ padding: 32, background: '#F5F5F0', borderRadius: 20 }}>
            <h2 style={{ fontFamily: '"Feather Bold", serif', fontSize: 28, color: '#0C3C26', marginBottom: 16 }}>Our Story</h2>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7 }}>
              Started by parents who struggled to find activities for their own kids, Jungle was born from the simple idea that discovering great things to do shouldn't be hard. Today, we connect thousands of families with amazing experiences across Singapore.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div style={{ marginBottom: 60 }}>
          <h2 style={{ fontFamily: '"Feather Bold", serif', fontSize: 32, color: '#0C3C26', marginBottom: 32, textAlign: 'center' }}>
            What we believe in
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            <div style={{ padding: 28, background: '#F5F5F0', borderRadius: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E5F5ED', color: '#009B4D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {Ico.heart(24)}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0C3C26', marginBottom: 8 }}>Made by Parents</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                We understand the challenges of parenting because we're parents too. Every feature is built with real families in mind.
              </p>
            </div>
            <div style={{ padding: 28, background: '#F5F5F0', borderRadius: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E5F5ED', color: '#009B4D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {Ico.shield(24)}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0C3C26', marginBottom: 8 }}>Quality First</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                We carefully curate and verify every activity to ensure it meets our high standards for safety, education, and fun.
              </p>
            </div>
            <div style={{ padding: 28, background: '#F5F5F0', borderRadius: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#E5F5ED', color: '#009B4D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                {Ico.users(24)}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0C3C26', marginBottom: 8 }}>Community Driven</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                Our community of parents shares reviews, tips, and recommendations to help each other find the best experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}