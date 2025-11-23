'use client';

import { useEffect, useState } from 'react';
import SearchableContent from '@/components/SearchableContent';

export default function Home() {
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersRes = await fetch('/api/users');
        const connectionsRes = await fetch('/api/connections/all');
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
        
        if (connectionsRes.ok) {
          const connectionsData = await connectionsRes.json();
          setConnections(connectionsData);
        }
      } catch (e) {
        console.error('Failed to fetch data:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        color: 'var(--foreground)'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <SearchableContent users={users} connections={connections} />
  );
}
