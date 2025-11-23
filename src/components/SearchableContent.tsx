'use client';

import React, { useState } from 'react';
import { User, Connection } from '@prisma/client';
import MembersTable from './MembersTable';
import NetworkGraph from './NetworkGraph';
import AuthButton from './AuthButton';
import AsciiBackground from './AsciiBackground';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface SearchableContentProps {
    users: User[];
    connections: Connection[];
}

export default function SearchableContent({ users, connections }: SearchableContentProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = searchQuery
        ? users.filter(user =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.program?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : users;

    const filteredUserIds = new Set(filteredUsers.map(u => u.id));
    const filteredConnections = searchQuery
        ? connections.filter(conn =>
            filteredUserIds.has(conn.fromId) && filteredUserIds.has(conn.toId)
        )
        : connections;

    return (
        <main className="main-container">
            <AsciiBackground />
            <div className="content-wrapper">
                <div className="header-section">
                    <div className="title-row">
                        <h1 className="title">uwaterloo.network</h1>
                        <AuthButton />
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
                            If your are or ever were a uwaterloo student your welcome to <Link href="/join" className="join-link">join</Link> ;)
                        </p>
                    </div>
                </div>

                <div className="table-section">
                    <MembersTable users={filteredUsers} searchQuery={searchQuery} />
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
                    users={users} 
                    connections={connections} 
                    highlightedUserIds={filteredUsers.map(u => u.id)}
                    searchQuery={searchQuery}
                />
            </div>
        </main>
    );
}

