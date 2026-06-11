'use client';

import React from 'react';
import { NavWrapper } from '../_components/NavWrapper';
import { Footer } from '../_components/Primitives';

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Manrope, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavWrapper />
      <div style={{ maxWidth: 1256, margin: '0 auto', padding: '84px 16px 32px', flexGrow: 1 }}>
        <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: 24, marginBottom: 40 }}>
          <h1 style={{ fontFamily: '"Feather Bold", serif', fontSize: 30, fontWeight: 'bold', color: '#000' }}>
            About Us
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 48, alignItems: 'start' }}>
          {/* Left Side - Content */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, color: '#374151' }}>
              <p style={{ lineHeight: 1.6 }}>
                Jungle was born from the joys and challenges of
                parenting—because, let's be honest, we've all found ourselves
                wondering, "What can I do with my kids today?" As parents, we
                know how tough it can be to juggle busy schedules while
                finding fun, meaningful, and enriching activities that truly
                engage our little ones.
              </p>

              <p style={{ lineHeight: 1.6 }}>
                That's why we created <strong>Jungle</strong>—your go-to
                platform for discovering and booking the best activities for
                kids in Singapore. Whether it's playtime, an exciting outdoor
                adventure, or a hands-on learning experience, our easy-to-use
                app takes the guesswork out of planning. We've done the
                searching so you don't have to, curating the best local
                activities that inspire growth, learning, and endless fun.
              </p>

              <p style={{ lineHeight: 1.6 }}>
                Say goodbye to endless Google searches—
                <strong>Jungle makes it easy</strong>. With personalized
                recommendations based on your child's interests, age, and
                developmental needs, finding the perfect activity is just a
                tap away. From thousands of trusted providers, every
                experience is handpicked to spark curiosity, build confidence,
                and create unforgettable moments.
              </p>

              <p style={{ lineHeight: 1.6 }}>
                So, let's make every day an opportunity for discovery.{" "}
                <strong>
                  Explore, book, and watch your child grow with Jungle
                </strong>
                .
              </p>
            </div>
          </div>

          {/* Right Side - Image */}
          <div style={{ flex: 1 }}>
            <img
              src="/aboutus.png"
              alt="About Jungle"
              style={{
                borderRadius: 8,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                width: '100%',
                height: 'auto',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}