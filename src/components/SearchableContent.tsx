'use client';

import React, { useState, useEffect } from 'react';
import { Member, Connection } from '@/data/members';
import MembersTable from './MembersTable';
import NetworkGraph from './NetworkGraph';
import AsciiBackground from './AsciiBackground';
import JoinModal from './JoinModal';
import { Search } from 'lucide-react';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

interface SearchableContentProps {
    members: Member[];
    connections: Connection[];
}

export default function SearchableContent({ members, connections }: SearchableContentProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [shuffledMembers, setShuffledMembers] = useState<Member[]>(members);
    const [showJoinModal, setShowJoinModal] = useState(false);

    // Shuffle members only on client side after hydration
    useEffect(() => {
        setShuffledMembers(shuffleArray(members));
    }, [members]);

    const filteredMembers = searchQuery
        ? shuffledMembers.filter(member =>
            member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.website?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : shuffledMembers;

    const filteredMemberIds = new Set(filteredMembers.map(m => m.id));
    const filteredConnections = searchQuery
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
                        <h1 className="title">uhouston.network</h1>
                    </div>
                    <div className="description">
                        <p>welcome to the official webring for university of houston students.</p>
                        <p>
                            our school is home to some of the most talented engineers, builders, makers,
                            artists, designers, writers, and everything in between. this is a place to
                            find other cool coogs who also go to UH, a directory of the people
                            who actually make this place special.
                        </p>
                        <p>
                            want to join? <button
                                onClick={() => setShowJoinModal(true)}
                                className="join-link"
                            >
                                fill out the form →
                            </button>
                        </p>
                    </div>
                </div>

                <div className="table-section">
                    <MembersTable members={filteredMembers} searchQuery={searchQuery} />
                </div>
            </div>

            <div className="graph-section">
                <div className="search-bar-container">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search members..."
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
                </div>
                <NetworkGraph
                    members={members}
                    connections={connections}
                    highlightedMemberIds={filteredMembers.map(m => m.id)}
                    searchQuery={searchQuery}
                />
            </div>

            <JoinModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
        </main>
    );
}
