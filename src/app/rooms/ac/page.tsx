import React, { Suspense } from 'react';
import ACClient from './Client';

export default function ACPage() {
  return (
    <Suspense fallback={null}>
      <ACClient />
    </Suspense>
  );
}
