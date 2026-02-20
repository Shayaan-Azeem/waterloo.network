'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface Submission {
    id: string;
    name: string;
    website: string;
    program?: string;
    year?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    connections?: string[];
    submittedAt: string;
}

interface Member {
    id: string;
    name: string;
    website: string;
    program?: string;
    year?: string;
    profilePic?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    connections?: string[];
}

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [authed, setAuthed] = useState(false);
    const [tab, setTab] = useState<'submissions' | 'members'>('submissions');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const fetchSubmissions = useCallback(async () => {
        try {
            const res = await fetch('/api/admin', {
                headers: { 'x-admin-password': password },
            });
            if (res.status === 401) { setAuthed(false); setError('Wrong password'); return; }
            const data = await res.json();
            setSubmissions(data.submissions || []);
            setAuthed(true);
        } catch {
            setError('Failed to load');
        }
    }, [password]);

    const fetchMembers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/members', {
                headers: { 'x-admin-password': password },
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members || []);
            }
        } catch { /* ignore */ }
    }, [password]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        await fetchSubmissions();
        await fetchMembers();
        setLoading(false);
    };

    const handleSubmissionAction = async (id: string, action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
                body: JSON.stringify({ id, action }),
            });
            if (!res.ok) throw new Error('Failed');
            setSubmissions(prev => prev.filter(s => s.id !== id));
            if (action === 'approve') await fetchMembers(); // refresh members list
        } catch {
            setError(`Failed to ${action} ${id}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm(`Remove ${id} from the webring?`)) return;
        setActionLoading(id);
        try {
            const res = await fetch('/api/admin/members', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error('Failed');
            setMembers(prev => prev.filter(m => m.id !== id));
        } catch {
            setError(`Failed to delete ${id}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingMember) return;
        setActionLoading(editingMember.id);
        try {
            const res = await fetch('/api/admin/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
                body: JSON.stringify(editingMember),
            });
            if (!res.ok) throw new Error('Failed');
            await fetchMembers();
            setEditingMember(null);
        } catch {
            setError(`Failed to update ${editingMember.name}`);
        } finally {
            setActionLoading(null);
        }
    };

    // Auto-refresh
    useEffect(() => {
        if (!authed) return;
        const interval = setInterval(() => { fetchSubmissions(); fetchMembers(); }, 30000);
        return () => clearInterval(interval);
    }, [authed, fetchSubmissions, fetchMembers]);

    if (!authed) {
        return (
            <div className="admin-page">
                <div className="admin-login">
                    <h1>🔒</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="admin password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="admin-password-input"
                            autoFocus
                        />
                        <button type="submit" className="admin-login-btn" disabled={loading}>
                            {loading ? '...' : 'enter'}
                        </button>
                    </form>
                    {error && <p className="admin-error">{error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <div className="admin-header">
                    <h1>admin</h1>
                    <div className="admin-tabs">
                        <button
                            className={`admin-tab ${tab === 'submissions' ? 'active' : ''}`}
                            onClick={() => setTab('submissions')}
                        >
                            submissions ({submissions.length})
                        </button>
                        <button
                            className={`admin-tab ${tab === 'members' ? 'active' : ''}`}
                            onClick={() => setTab('members')}
                        >
                            members ({members.length})
                        </button>
                    </div>
                </div>

                {error && <p className="admin-error">{error}</p>}

                {/* ---- Submissions Tab ---- */}
                {tab === 'submissions' && (
                    submissions.length === 0 ? (
                        <div className="admin-empty"><p>no pending submissions 🎉</p></div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>name</th>
                                        <th>website</th>
                                        <th>program</th>
                                        <th>year</th>
                                        <th>submitted</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(s => (
                                        <tr key={s.id}>
                                            <td className="admin-name">{s.name}</td>
                                            <td><a href={s.website} target="_blank" rel="noopener noreferrer" className="admin-link">{s.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></td>
                                            <td>{s.program || '—'}</td>
                                            <td>{s.year || '—'}</td>
                                            <td className="admin-date">{new Date(s.submittedAt).toLocaleDateString()}</td>
                                            <td className="admin-actions">
                                                <button onClick={() => handleSubmissionAction(s.id, 'approve')} className="admin-btn admin-btn-approve" disabled={actionLoading === s.id}>✓</button>
                                                <button onClick={() => handleSubmissionAction(s.id, 'reject')} className="admin-btn admin-btn-reject" disabled={actionLoading === s.id}>✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* ---- Members Tab ---- */}
                {tab === 'members' && (
                    members.length === 0 ? (
                        <div className="admin-empty"><p>no members yet</p></div>
                    ) : (
                        <div className="admin-table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>name</th>
                                        <th>website</th>
                                        <th>program</th>
                                        <th>year</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map(m => (
                                        <tr key={m.id}>
                                            <td className="admin-name">{m.name}</td>
                                            <td><a href={m.website} target="_blank" rel="noopener noreferrer" className="admin-link">{m.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></td>
                                            <td>{m.program || '—'}</td>
                                            <td>{m.year || '—'}</td>
                                            <td className="admin-actions">
                                                <button onClick={() => setEditingMember({ ...m })} className="admin-btn admin-btn-edit" disabled={actionLoading === m.id}>✎</button>
                                                <button onClick={() => handleDeleteMember(m.id)} className="admin-btn admin-btn-reject" disabled={actionLoading === m.id}>✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            {/* ---- Edit Modal ---- */}
            {editingMember && (
                <div className="modal-overlay" onClick={() => setEditingMember(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setEditingMember(null)} aria-label="Close">
                            <X size={20} />
                        </button>
                        <div className="modal-header">
                            <h2>edit member</h2>
                        </div>
                        <div className="edit-form">
                            {(['name', 'website', 'program', 'year', 'instagram', 'twitter', 'linkedin'] as const).map(field => (
                                <div className="form-group" key={field}>
                                    <label htmlFor={`edit-${field}`}>{field}</label>
                                    <input
                                        id={`edit-${field}`}
                                        value={(editingMember[field] as string) || ''}
                                        onChange={e => setEditingMember(prev => prev ? { ...prev, [field]: e.target.value } : null)}
                                    />
                                </div>
                            ))}
                            <div className="edit-actions">
                                <button className="submit-btn" onClick={handleSaveEdit} disabled={actionLoading === editingMember.id}>
                                    {actionLoading === editingMember.id ? 'saving...' : 'save changes'}
                                </button>
                                <button className="admin-cancel-btn" onClick={() => setEditingMember(null)}>
                                    cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
