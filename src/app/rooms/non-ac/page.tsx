import React, { Suspense } from 'react';
import NonACClient from './Client';

export default function NonACPage() {
  return (
    <Suspense fallback={null}>
      <NonACClient />
    </Suspense>
  );
}
