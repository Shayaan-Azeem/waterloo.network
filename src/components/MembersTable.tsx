import React from 'react';
import { Member } from '@/data/members';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface MembersTableProps {
    members: Member[];
    searchQuery?: string;
    membersWithoutEmbed?: Set<string>;
    referrerDullIds?: Set<string>;
}

export default function MembersTable({ members, searchQuery, membersWithoutEmbed = new Set(), referrerDullIds = new Set() }: MembersTableProps) {
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
            <div className="search-results-info">
                {searchQuery ? (
                    members.length === 0 
                        ? `No results found for "${searchQuery}"`
                        : `Found ${members.length} member${members.length !== 1 ? 's' : ''}`
                ) : (
                    <span className="search-results-placeholder">&nbsp;</span>
                )}
            </div>
            <table className="members-table">
                <thead>
                    <tr>
                        <th>name</th>
                        <th>program</th>
                        <th>site</th>
                        <th>links</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member, index) => {
                        const isDulled = membersWithoutEmbed.has(member.id) || referrerDullIds.has(member.id);
                        const rowOpacity = isDulled ? 0.5 : undefined;
                        return (
                        <tr key={member.id} style={rowOpacity ? { opacity: rowOpacity } : undefined}>
                            <td className="user-cell">
                                {member.profilePic ? (
                                    <img 
                                        src={member.profilePic} 
                                        alt={member.name || 'Member'} 
                                        className={`avatar ${searchQuery && index === 0 ? 'avatar-highlighted' : ''}`}
                                    />
                                ) : (
                                    <div 
                                        className={`avatar ${searchQuery && index === 0 ? 'avatar-highlighted' : ''}`}
                                        style={{ backgroundColor: '#e0e0e0' }} 
                                    />
                                )}
                                {member.website && member.website.trim() ? (
                                    <a 
                                        href={member.website.startsWith('http') ? member.website : `https://${member.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="name-link"
                                    >
                                        {highlightText(member.name) || 'No name'}
                                    </a>
                                ) : (
                                <span>{highlightText(member.name) || 'No name'}</span>
                                )}
                            </td>
                            <td>{highlightText(member.program) || '—'}</td>
                            <td>
                                {member.website && member.website.trim() ? (
                                    <a 
                                        href={member.website.startsWith('http') ? member.website : `https://${member.website}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="site-link"
                                    >
                                        {member.website.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')}
                                    </a>
                                ) : (
                                    <span className="table-placeholder">—</span>
                                )}
                            </td>
                            <td>
                                <div className="social-icons">
                                    {member.instagram && (
                                        <a 
                                            href={member.instagram} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="social-icon-link"
                                            title="Instagram"
                                        >
                                            <FaInstagram size={16} />
                                        </a>
                                    )}
                                    {member.twitter && (
                                        <a 
                                            href={member.twitter} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="social-icon-link"
                                            title="Twitter/X"
                                        >
                                            <FaXTwitter size={16} />
                                        </a>
                                    )}
                                    {member.linkedin && (
                                        <a 
                                            href={member.linkedin} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="social-icon-link"
                                            title="LinkedIn"
                                        >
                                            <FaLinkedin size={16} />
                                        </a>
                                    )}
                                    {!member.instagram && !member.twitter && !member.linkedin && (
                                        <span className="table-placeholder">—</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
