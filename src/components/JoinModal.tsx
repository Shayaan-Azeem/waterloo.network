'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface JoinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinModal({ isOpen, onClose }: JoinModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        website: '',
        program: '',
        year: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        connections: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            const res = await fetch('/api/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong');
            }

            setStatus('success');
        } catch (err: unknown) {
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
        }
    };

    const handleClose = () => {
        onClose();
        // Reset form after close animation
        setTimeout(() => {
            setFormData({ name: '', website: '', program: '', year: '', instagram: '', twitter: '', linkedin: '', connections: '' });
            setStatus('idle');
            setErrorMessage('');
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose} aria-label="Close">
                    <X size={20} />
                </button>

                {status === 'success' ? (
                    <div className="success-card">
                        <div className="success-icon">🎉</div>
                        <h2>You&apos;re in!</h2>
                        <p>Your submission has been received. We&apos;ll review it and add you to the webring shortly.</p>
                        <button className="submit-btn" onClick={handleClose}>
                            close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="modal-header">
                            <h2>join the webring</h2>
                            <p className="join-subtitle">
                                fill out this form to join uhouston.network. you just need a personal website
                                and to be a UH student — that&apos;s it.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="join-form">
                            <div className="form-section">
                                <h3>basics</h3>
                                <div className="form-group">
                                    <label htmlFor="name">full name <span className="required">*</span></label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="website">personal website <span className="required">*</span></label>
                                    <input
                                        id="website"
                                        name="website"
                                        type="url"
                                        required
                                        placeholder="https://yourwebsite.com"
                                        value={formData.website}
                                        onChange={handleChange}
                                    />
                                    <span className="form-hint">this is what the webring links to — make it yours!</span>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>about you</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="program">program / major</label>
                                        <input
                                            id="program"
                                            name="program"
                                            type="text"
                                            placeholder="e.g. Computer Science"
                                            value={formData.program}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="year">graduation year</label>
                                        <input
                                            id="year"
                                            name="year"
                                            type="text"
                                            placeholder="e.g. 2027"
                                            value={formData.year}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>socials</h3>
                                <p className="section-hint">all optional — add any you&apos;d like shown on your profile</p>
                                <div className="form-group">
                                    <label htmlFor="instagram">instagram</label>
                                    <input
                                        id="instagram"
                                        name="instagram"
                                        type="url"
                                        placeholder="https://instagram.com/yourhandle"
                                        value={formData.instagram}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="twitter">twitter / X</label>
                                    <input
                                        id="twitter"
                                        name="twitter"
                                        type="url"
                                        placeholder="https://x.com/yourhandle"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="linkedin">linkedin</label>
                                    <input
                                        id="linkedin"
                                        name="linkedin"
                                        type="url"
                                        placeholder="https://linkedin.com/in/yourprofile"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>connections</h3>
                                <div className="form-group">
                                    <label htmlFor="connections">friends in the webring</label>
                                    <input
                                        id="connections"
                                        name="connections"
                                        type="text"
                                        placeholder="e.g. jane-doe, bob-smith"
                                        value={formData.connections}
                                        onChange={handleChange}
                                    />
                                    <span className="form-hint">comma-separated names of people you know. you can always update this later.</span>
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="form-error">
                                    {errorMessage}
                                </div>
                            )}

                            <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
                                {status === 'submitting' ? 'submitting...' : 'join the webring →'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
