'use client';

import React, { useState } from 'react';
import { Member, Connection } from '@/data/members';
import MembersTable from './MembersTable';
import NetworkGraph from './NetworkGraph';
import AsciiBackground from './AsciiBackground';
import { Search, Github } from 'lucide-react';

interface SearchableContentProps {
    members: Member[];
    connections: Connection[];
}

export default function SearchableContent({ members, connections }: SearchableContentProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMembers = searchQuery
        ? members.filter(member =>
            member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.website?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : members;

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
                        <h1 className="title">uwaterloo.network</h1>
                        <a 
                            href="https://github.com/Shayaan-Azeem/waterloo.network"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="github-link"
                            title="Add yourself via Pull Request"
                        >
                            <Github size={20} />
                            <span>Join via PR</span>
                        </a>
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
                            </a> to add yourself to the ring!
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
        </main>
    );
}
