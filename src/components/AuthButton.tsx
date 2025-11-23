'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return null;

  if (user) {
    return (
      <div className="auth-button-container">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="auth-button"
        >
          edit profile
        </button>
        <button 
          onClick={logout} 
          className="auth-button-secondary"
        >
          logout
        </button>
      </div>
    );
  }

  return null;
}

