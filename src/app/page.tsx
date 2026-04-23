'use client';

import { Suspense } from 'react';
import SearchableContent from '@/components/SearchableContent';
import { members, getConnections } from '@/data/members';

export default function Home() {
  const connections = getConnections();

  return (
    <Suspense>
      <SearchableContent members={members} connections={connections} />
    </Suspense>
  );
}
