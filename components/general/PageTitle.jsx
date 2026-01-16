'use client';

import React from 'react';
import '@/styles/pages.scss';

export default function PageTitle({ title, subtitle }) {
  return (
    <div className="page-header">
      {title && <h1>{title}</h1>}
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
