'use client';

import { useState } from 'react';

export default function NavToggle() {
  const [open, setOpen] = useState(false);

  return (
    <button
      className="nav-toggle"
      aria-label="Toggle navigation"
      onClick={() => {
        const navLinks = document.getElementById('nav-links');
        if (navLinks) {
          navLinks.classList.toggle('open');
        }
        setOpen(!open);
      }}
    >
      {open ? '✕' : '☰'}
    </button>
  );
}
