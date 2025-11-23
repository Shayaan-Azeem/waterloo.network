import React from 'react';
import { User } from '@prisma/client';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface MembersTableProps {
    users: User[];
    searchQuery?: string;
}

export default function MembersTable({ users, searchQuery }: MembersTableProps) {
    const highlightText = (text: string | null | undefined) => {
        if (!text || !searchQuery) return text || '';
        
        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === searchQuery.toLowerCase() 
                ? <mark key={i} style={{ background: '#ffd54f', padding: '0 2px' }}>{part}</mark>
                : part
        );
    };

    return (
        <div className="members-table-container">
            {searchQuery && (
                <div className="search-results-info">
                    {users.length === 0 
                        ? `No results found for "${searchQuery}"`
                        : `Found ${users.length} member${users.length !== 1 ? 's' : ''}`}
                </div>
            )}
            <table className="members-table">
                <thead>
                    <tr>
                        <th>name</th>
                        <th>program</th>
                        <th>year</th>
                        <th>site</th>
                        <th>links</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id}>
                            <td className="user-cell">
                                {user.profilePic ? (
                                    <img 
                                        src={user.profilePic} 
                                        alt={user.name || 'User'} 
                                        className={`avatar ${searchQuery && index === 0 ? 'avatar-highlighted' : ''}`}
                                    />
                                ) : (
                                    <div 
                                        className={`avatar ${searchQuery && index === 0 ? 'avatar-highlighted' : ''}`}
                                        style={{ backgroundColor: '#e0e0e0' }} 
                                    />
                                )}
                                <span>{highlightText(user.name) || 'No name'}</span>
                            </td>
                            <td>{highlightText(user.program) || '—'}</td>
                            <td>{user.year || '—'}</td>
                            <td>
                                {user.website && user.website.trim() && !user.website.includes('@') ? (
                                    <a 
                                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="site-link"
                                    >
                                        {user.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')}
                                    </a>
                                ) : (
                                    <span className="table-placeholder">—</span>
                                )}
                            </td>
                            <td>
                                <div className="social-icons">
                                    {user.instagram && (
                                        <a 
                                            href={`https://instagram.com/${user.instagram}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="social-icon-link"
                                            title={`Instagram: ${user.instagram}`}
                                        >
                                            <FaInstagram size={16} />
                                        </a>
                                    )}
                                    {user.twitter && (
                                        <a 
                                            href={`https://x.com/${user.twitter}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="social-icon-link"
                                            title={`Twitter: ${user.twitter}`}
                                        >
                                            <FaXTwitter size={16} />
                                        </a>
                                    )}
                                    {user.linkedin && (
                                        <a 
                                            href={`https://linkedin.com/in/${user.linkedin}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="social-icon-link"
                                            title={`LinkedIn: ${user.linkedin}`}
                                        >
                                            <FaLinkedin size={16} />
                                        </a>
                                    )}
                                    {!user.instagram && !user.twitter && !user.linkedin && (
                                        <span className="table-placeholder">—</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
