'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { checkAuth } from '@/lib/auth';

export default function JoinPage() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [code, setCode] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = async () => {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                router.push('/dashboard');
            } else {
                setCheckingAuth(false);
            }
        };
        checkAuthentication();
    }, [router]);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'send' }),
            });
            if (res.ok) {
                setStep('code');
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, action: 'verify' }),
            });
            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError(true);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="auth-container">
                <p className="auth-message">checking authentication...</p>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-content">
                <Link href="/" className="back-link">← back</Link>
                
                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className="auth-form">
                        <h1 className="auth-title">what is your uwaterloo email address?</h1>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="j1doe@uwaterloo.ca"
                            className="auth-input"
                            required
                            autoFocus
                            disabled={loading}
                        />
                        {loading && <p className="auth-message">sending...</p>}
                        {error && <p className="auth-error">something went wrong. try again.</p>}
                    </form>
                ) : (
                    <form onSubmit={handleCodeSubmit} className="auth-form">
                        <h1 className="auth-title">we sent you a code :)</h1>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="123456"
                            className="auth-input code-input"
                            maxLength={6}
                            pattern="[0-9]{6}"
                            required
                            autoFocus
                            disabled={loading}
                        />
                        {loading && <p className="auth-message">verifying...</p>}
                        {error && <p className="auth-error">invalid code. try again.</p>}
                    </form>
                )}
            </div>
        </div>
    );
}
