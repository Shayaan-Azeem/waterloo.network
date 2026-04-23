'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Member, Connection, ROLE_OPTIONS, VERTICAL_OPTIONS } from '@/data/members';
import MembersTable from './MembersTable';
import NetworkGraph from './NetworkGraph';
import AsciiBackground from './AsciiBackground';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

interface EmbedFailure {
    id: string;
    name: string;
    reason: string;
    url: string;
}

interface SearchableContentProps {
    members: Member[];
    connections: Connection[];
}

export default function SearchableContent({ members, connections }: SearchableContentProps) {
    const searchParams = useSearchParams();
    const referrerId = searchParams.get('ref');

    const [searchQuery, setSearchQuery] = useState('');
    const [shuffledMembers, setShuffledMembers] = useState<Member[]>(members);
    const [activeRoles, setActiveRoles] = useState<Set<string>>(new Set());
    const [activeVerticals, setActiveVerticals] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [membersWithoutEmbed, setMembersWithoutEmbed] = useState<Set<string>>(new Set());

    const referrerMember = useMemo(
        () => (referrerId ? members.find(m => m.id === referrerId) ?? null : null),
        [referrerId, members]
    );

    const referrerDullIds = useMemo(() => {
        if (!referrerMember) return new Set<string>();
        const circle = new Set([referrerMember.id, ...(referrerMember.connections || [])]);
        return new Set(members.filter(m => !circle.has(m.id)).map(m => m.id));
    }, [referrerMember, members]);

    // Fetch embed check data
    useEffect(() => {
        fetch('/api/embedcheck')
            .then(res => res.json())
            .then(data => {
                const failedIds = new Set<string>(data.failures?.map((f: EmbedFailure) => f.id) || []);
                setMembersWithoutEmbed(failedIds);
            })
            .catch(err => console.error('Failed to fetch embed check:', err));
    }, []);

    // Shuffle members, keeping embed-less at bottom and referrer + connections at top
    useEffect(() => {
        const sortGroup = (arr: Member[]) => {
            const withEmbed = arr.filter(m => !membersWithoutEmbed.has(m.id));
            const withoutEmbed = arr.filter(m => membersWithoutEmbed.has(m.id));
            return [...shuffleArray(withEmbed), ...shuffleArray(withoutEmbed)];
        };

        if (referrerMember) {
            const connectionIds = new Set(referrerMember.connections || []);
            const connectionsGroup = members.filter(m => connectionIds.has(m.id) && m.id !== referrerMember.id);
            const rest = members.filter(m => m.id !== referrerMember.id && !connectionIds.has(m.id));
            setShuffledMembers([referrerMember, ...sortGroup(connectionsGroup), ...sortGroup(rest)]);
        } else {
            setShuffledMembers(sortGroup(members));
        }
    }, [members, membersWithoutEmbed, referrerMember]);

    const hasActiveFilters = activeRoles.size > 0 || activeVerticals.size > 0;

    const toggleRole = (role: string) => {
        setActiveRoles(prev => {
            const next = new Set(prev);
            if (next.has(role)) next.delete(role);
            else next.add(role);
            return next;
        });
    };

    const toggleVertical = (vertical: string) => {
        setActiveVerticals(prev => {
            const next = new Set(prev);
            if (next.has(vertical)) next.delete(vertical);
            else next.add(vertical);
            return next;
        });
    };

    const clearAllFilters = () => {
        setActiveRoles(new Set());
        setActiveVerticals(new Set());
        setSearchQuery('');
    };

    const filteredMembers = useMemo(() => {
        let result = shuffledMembers;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(member =>
                member.name?.toLowerCase().includes(q) ||
                member.program?.toLowerCase().includes(q) ||
                member.website?.toLowerCase().includes(q) ||
                member.roles?.some(r => r.toLowerCase().includes(q)) ||
                member.verticals?.some(v => v.toLowerCase().includes(q)) ||
                member.year?.includes(q)
            );
        }

        if (activeRoles.size > 0) {
            result = result.filter(member =>
                member.roles?.some(r => activeRoles.has(r))
            );
        }

        if (activeVerticals.size > 0) {
            result = result.filter(member =>
                member.verticals?.some(v => activeVerticals.has(v))
            );
        }

        return result;
    }, [shuffledMembers, searchQuery, activeRoles, activeVerticals]);

    const filteredMemberIds = new Set(filteredMembers.map(m => m.id));
    const isFiltering = searchQuery || hasActiveFilters;
    const filteredConnections = isFiltering
        ? connections.filter(conn =>
            filteredMemberIds.has(conn.fromId) && filteredMemberIds.has(conn.toId)
        )
        : connections;


    return (
        <main className="main-container">
            <AsciiBackground />
            <div className="content-wrapper">
                <div className="header-section">
                    <div className="title-row">
                        <a href="/" className="title" style={{ textDecoration: 'none', color: 'inherit' }}>uwaterloo.network</a>
                    </div>
                    <div className="description">
                        <p>welcome to the official webring for university of waterloo students.</p>
                        <p>
                            our school is home to some of the most talented engineers, builders, makers, 
                            artists, designers, writers, and everything in between. this is a place to 
                            find other cool people who also go to waterloo, a directory of the people 
                            who actually make this place special.
                        </p>
                        <p>
                            want to join? <a 
                                href="https://github.com/Shayaan-Azeem/waterloo.network#join-the-webring" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="join-link"
                            >
                                submit a pull request
                            </a>
                        </p>
                    </div>
                </div>

                <div className="table-section">
                    <MembersTable members={filteredMembers} searchQuery={searchQuery} membersWithoutEmbed={membersWithoutEmbed} referrerDullIds={referrerDullIds} />
                </div>
            </div>

            <div className="graph-section">
                <div className="search-wrapper">
                    <div className="search-bar-container">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="search-clear-btn"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            className="filters-toggle"
                            onClick={() => setShowFilters(prev => !prev)}
                        >
                            <span>filters</span>
                            {hasActiveFilters && (
                                <span className="filter-count">
                                    {activeRoles.size + activeVerticals.size}
                                </span>
                            )}
                            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="filters-panel">
                            <div className="filter-group">
                                <span className="filter-label">roles</span>
                                <div className="filter-tags">
                                    {ROLE_OPTIONS.map(role => (
                                        <button
                                            key={role}
                                            className={`filter-tag ${activeRoles.has(role) ? 'filter-tag-active' : ''}`}
                                            onClick={() => toggleRole(role)}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <span className="filter-label">verticals</span>
                                <div className="filter-tags">
                                    {VERTICAL_OPTIONS.map(vertical => (
                                        <button
                                            key={vertical}
                                            className={`filter-tag ${activeVerticals.has(vertical) ? 'filter-tag-active' : ''}`}
                                            onClick={() => toggleVertical(vertical)}
                                        >
                                            {vertical}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                className={`clear-filters-btn ${!hasActiveFilters ? 'clear-filters-btn-disabled' : ''}`} 
                                onClick={clearAllFilters}
                                disabled={!hasActiveFilters}
                            >
                                <X size={14} />
                                clear all filters
                            </button>
                        </div>
                    )}
                </div>

                <NetworkGraph
                    members={members}
                    connections={connections}
                    highlightedMemberIds={filteredMembers.map(m => m.id)}
                    searchQuery={searchQuery}
                    membersWithoutEmbed={membersWithoutEmbed}
                    referrerDullIds={referrerDullIds}
                />
            </div>
        </main>
    );
}
