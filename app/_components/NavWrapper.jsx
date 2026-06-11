'use client';

import React from 'react';
import { Nav } from './Primitives';

export function NavWrapper() {
  const go = (screen) => {
    if (screen === 'landing') {
      window.location.href = '/';
    } else if (screen === 'browse') {
      window.location.href = '/';
    } else if (screen === 'contact') {
      window.location.href = '/contact';
    }
  };

  return <Nav go={go} theme={null} />;
}