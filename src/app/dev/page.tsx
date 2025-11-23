'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DevPage() {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        program: '',
        year: '',
        website: '',
        bio: '',
        profilePic: '',
        instagram: '',
        twitter: '',
        linkedin: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/dev/add-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                setMessage(`✅ User added successfully! ID: ${data.user.id}`);
                setFormData({
                    email: '',
                    name: '',
                    program: '',
                    year: '',
                    website: '',
                    bio: '',
                    profilePic: '',
                    instagram: '',
                    twitter: '',
                    linkedin: '',
                });
            } else {
                const error = await res.json();
                setMessage(`❌ Error: ${error.error}`);
            }
        } catch (err) {
            setMessage(`❌ Error: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    🛠️ Dev: Add Test User
                </h1>
                <p style={{ color: '#666' }}>
                    Manually add users to the database for testing. This bypasses email verification.
                </p>
                <button 
                    onClick={() => router.push('/')}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#111',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Home
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Email <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="user@uwaterloo.ca"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Program
                    </label>
                    <input
                        type="text"
                        name="program"
                        value={formData.program}
                        onChange={handleChange}
                        placeholder="Computer Science"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Graduation Year
                    </label>
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="">Select Year</option>
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Website
                    </label>
                    <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yoursite.com"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Profile Picture URL
                    </label>
                    <input
                        type="url"
                        name="profilePic"
                        value={formData.profilePic}
                        onChange={handleChange}
                        placeholder="https://i.imgur.com/abc123.jpg"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="A short bio..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <div style={{ 
                    padding: '1.5rem', 
                    background: '#f9f9f9', 
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>
                        Social Links
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                Instagram
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
                                <span style={{ padding: '0.75rem', color: '#666', fontSize: '0.9rem' }}>instagram.com/</span>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="username"
                                    style={{ flex: 1, border: 'none', padding: '0.75rem', outline: 'none', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                Twitter/X
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
                                <span style={{ padding: '0.75rem', color: '#666', fontSize: '0.9rem' }}>x.com/</span>
                                <input
                                    type="text"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder="username"
                                    style={{ flex: 1, border: 'none', padding: '0.75rem', outline: 'none', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                LinkedIn
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
                                <span style={{ padding: '0.75rem', color: '#666', fontSize: '0.9rem' }}>linkedin.com/in/</span>
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    placeholder="username"
                                    style={{ flex: 1, border: 'none', padding: '0.75rem', outline: 'none', fontSize: '1rem' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        background: loading ? '#666' : '#111',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.2s'
                    }}
                >
                    {loading ? 'Adding User...' : 'Add User to Database'}
                </button>

                {message && (
                    <div style={{
                        padding: '1rem',
                        background: message.includes('✅') ? '#d4edda' : '#f8d7da',
                        color: message.includes('✅') ? '#155724' : '#721c24',
                        borderRadius: '6px',
                        border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}

