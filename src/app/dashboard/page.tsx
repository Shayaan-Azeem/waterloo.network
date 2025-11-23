'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, Instagram, Twitter, Linkedin, Globe, X, ChevronLeft, ChevronRight, Copy, Check, Home, Users, UserPlus } from 'lucide-react';
import { logout } from '@/lib/auth';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [embedSettings, setEmbedSettings] = useState({
        color: 'black',
        arrow: 'arrow',
        customColor: '',
    });
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        website: '',
        program: '',
        year: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        profilePic: '',
    });
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch('/api/user/me');
                if (!userRes.ok) {
                    router.push('/join');
                    return;
                }
                
                const userData = await userRes.json();
                setUser(userData);

                const [first, ...last] = (userData.name || '').split(' ');
                    setFormData({
                        firstName: first || '',
                        lastName: last.join(' ') || '',
                    website: userData.website || '',
                    program: userData.program || '',
                    year: userData.year || '',
                    instagram: userData.instagram || '',
                    twitter: userData.twitter || '',
                    linkedin: userData.linkedin || '',
                    profilePic: userData.profilePic || '',
                });

                setEmbedSettings({
                    color: userData.embedColor || 'black',
                    arrow: userData.embedArrow || 'arrow',
                    customColor: userData.embedCustomColor || '',
                });

                const allUsersRes = await fetch('/api/users');
                if (allUsersRes.ok) {
                    const usersData = await allUsersRes.json();
                    setAllUsers(usersData.filter((u: any) => u.id !== userData.id));
                }

                if (userData.connections) {
                    setFriends(userData.connections.map((c: any) => c.toUser));
                }

                if (!userData.name || !userData.program) {
                    setEditMode(true);
                }
            } catch (e) {
                console.error(e);
                router.push('/join');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert('File size too large. Please upload an image under 4MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePic: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const fullName = `${formData.firstName} ${formData.lastName}`.trim();

        try {
            const res = await fetch('/api/user/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    website: formData.website,
                    program: formData.program,
                    year: formData.year,
                    instagram: formData.instagram,
                    twitter: formData.twitter,
                    linkedin: formData.linkedin,
                    profilePic: formData.profilePic,
                }),
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setEditMode(false);
            } else {
                alert('Failed to save profile');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving profile');
        }
    };

    const addFriend = async (friendId: string) => {
        try {
            const res = await fetch('/api/connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toUserId: friendId }),
            });

            if (res.ok) {
                const userToAdd = allUsers.find(u => u.id === friendId);
                if (userToAdd) {
                    setFriends([...friends, userToAdd]);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const removeFriend = async (friendId: string) => {
        try {
            const res = await fetch('/api/connections', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toUserId: friendId }),
            });

            if (res.ok) {
                setFriends(friends.filter(f => f.id !== friendId));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateEmbedSettings = async (settings: Partial<typeof embedSettings>) => {
        const newSettings = { ...embedSettings, ...settings };
        setEmbedSettings(newSettings);

        try {
            await fetch('/api/user/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embedColor: newSettings.color,
                    embedArrow: newSettings.arrow,
                    embedCustomColor: newSettings.customColor,
                }),
            });
        } catch (e) {
            console.error(e);
        }
    };

    const getIconPath = () => {
        if (embedSettings.color === 'custom' && embedSettings.customColor) {
            return `/icon.svg`; // Will color via CSS filter
        }
        const colorMap: Record<string, string> = {
            'black': '/icon.svg',
            'red': '/iconred.svg',
            'yellow': '/iconyellow.svg',
            'white': '/iconwhite.svg'
        };
        return colorMap[embedSettings.color] || '/icon.svg';
    };

    const getArrowIcon = (direction: 'left' | 'right') => {
        const icons = {
            arrow: direction === 'left' ? '←' : '→',
            chevron: direction === 'left' ? '‹' : '›',
            angle: direction === 'left' ? '〈' : '〉'
        };
        return icons[embedSettings.arrow as keyof typeof icons] || icons.arrow;
    };

    const getArrowColor = () => {
        if (embedSettings.color === 'custom' && embedSettings.customColor) {
            return embedSettings.customColor;
        }
        const colorMap: Record<string, string> = {
            'black': '#000000',
            'red': '#ba0e34',
            'yellow': '#ffd54f',
            'white': '#ffffff'
        };
        return colorMap[embedSettings.color] || '#000000';
    };

    const copyEmbedCode = () => {
        const attributes = [
            `src="${window.location.origin}/embed.js"`,
            `data-user="${user?.id}"`,
            `data-color="${embedSettings.color}"`,
            `data-arrow="${embedSettings.arrow}"`
        ];
        
        if (embedSettings.color === 'custom' && embedSettings.customColor) {
            attributes.push(`data-custom-color="${embedSettings.customColor}"`);
        }
        
        const code = `<script ${attributes.join(' ')}></script>`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getEmbedCodeDisplay = () => {
        const attributes = [
            `src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed.js"`,
            `data-user="${user?.id}"`,
            `data-color="${embedSettings.color}"`,
            `data-arrow="${embedSettings.arrow}"`
        ];
        
        if (embedSettings.color === 'custom' && embedSettings.customColor) {
            attributes.push(`data-custom-color="${embedSettings.customColor}"`);
        }
        
        return `<script ${attributes.join(' ')}></script>`;
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <p>Loading...</p>
            </div>
        );
    }

    const friendIds = friends.map(f => f.id);
    const availableUsers = allUsers.filter(u => !friendIds.includes(u.id));

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <Link href="/" className="home-icon-link" title="Home">
                    <Home size={20} />
                </Link>
                <button onClick={logout} className="logout-btn">logout</button>
            </div>
            <div className="dashboard-sidebar">
                <div className="profile-section">
                    {!editMode ? (
                        <>
                            <div 
                                className="profile-pic"
                                style={{ 
                                    backgroundImage: formData.profilePic ? `url(${formData.profilePic})` : 'none',
                                    backgroundColor: formData.profilePic ? 'transparent' : '#e0e0e0'
                                }}
                            />
                            <h2 className="profile-name">{user?.name || 'Your Name'}</h2>
                            <p className="profile-info">{user?.program || 'Program'} {user?.year || ''}</p>
                            {user?.createdAt && (
                                <p className="profile-info">
                                    Member Since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </p>
                            )}
                            {user?.website && (
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="profile-website">
                                    {user.website}
                                </a>
                            )}
                            
                            <div className="social-links">
                                {formData.instagram && (
                                    <a href={`https://instagram.com/${formData.instagram}`} target="_blank" rel="noopener noreferrer">
                                        <Instagram size={18} />
                                    </a>
                                )}
                                {formData.twitter && (
                                    <a href={`https://x.com/${formData.twitter}`} target="_blank" rel="noopener noreferrer">
                                        <Twitter size={18} />
                                    </a>
                                )}
                                {formData.linkedin && (
                                    <a href={`https://linkedin.com/in/${formData.linkedin}`} target="_blank" rel="noopener noreferrer">
                                        <Linkedin size={18} />
                                    </a>
                                )}
                                {user?.website && (
                                    <a href={user.website} target="_blank" rel="noopener noreferrer">
                                        <Globe size={18} />
                                    </a>
                                )}
                            </div>

                            <button onClick={() => setEditMode(true)} className="edit-profile-btn">
                                Edit Profile
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="edit-form">
                            <div className="profile-pic-edit-container">
                                <div 
                                    className="profile-pic"
                                    style={{ 
                                        backgroundImage: formData.profilePic ? `url(${formData.profilePic})` : 'none',
                                        backgroundColor: formData.profilePic ? 'transparent' : '#e0e0e0'
                                    }}
                                />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="upload-pic-btn"
                                >
                                    <Upload size={14} />
                            </button>
                    </div>

                            <div className="form-row">
                                    <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className="form-input"
                                />
                                    <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className="form-input"
                            />
                        </div>

                            <input
                                name="program"
                                value={formData.program}
                                onChange={handleChange}
                                placeholder="Program"
                                className="form-input"
                            />

                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange as any}
                                className="form-input"
                            >
                                <option value="">Graduation Year</option>
                                    {[2026, 2027, 2028, 2029, 2030].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>

                            <div className="website-input-wrapper">
                                <input
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://yourwebsite.com"
                                    className="form-input-website"
                                />
                                <span className="website-icon">
                                    <Globe size={16} />
                                </span>
                            </div>

                            <div className="social-input-wrapper">
                                <span className="social-prefix">instagram.com/</span>
                                <input
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    placeholder="username"
                                    className="form-input-social"
                                />
                        </div>

                            <div className="social-input-wrapper">
                                <span className="social-prefix">x.com/</span>
                                    <input
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder="username"
                                    className="form-input-social"
                                    />
                                </div>

                            <div className="social-input-wrapper">
                                <span className="social-prefix">linkedin.com/in/</span>
                                    <input
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    placeholder="username"
                                    className="form-input-social"
                                    />
                                </div>

                            <div className="form-actions">
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" onClick={() => setEditMode(false)} className="cancel-btn">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="friends-section">
                    <h3 className="section-title">
                        <Users size={16} className="section-icon" />
                        My Friends
                    </h3>
                    <div className="friends-list">
                        {friends.length === 0 ? (
                            <p className="empty-text">No friends added yet</p>
                        ) : (
                            friends.map(friend => (
                                <div key={friend.id} className="friend-item">
                                    <div 
                                        className="friend-avatar"
                                        style={{
                                            backgroundImage: friend.profilePic ? `url(${friend.profilePic})` : 'none',
                                            backgroundColor: friend.profilePic ? 'transparent' : '#e0e0e0'
                                        }}
                                    />
                                    <button
                                        onClick={() => removeFriend(friend.id)}
                                        className="remove-friend"
                                        title="Remove friend"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))
                        )}
                            </div>
                        </div>

                <div className="add-friends-section">
                    <h3 className="section-title">
                        <UserPlus size={16} className="section-icon" />
                        Add Friends
                    </h3>
                    <div className="friends-list">
                        {availableUsers.map(person => (
                            <div key={person.id} className="friend-item add-friend-item">
                                <div 
                                    className="friend-avatar"
                                    style={{
                                        backgroundImage: person.profilePic ? `url(${person.profilePic})` : 'none',
                                        backgroundColor: person.profilePic ? 'transparent' : '#4ade80'
                                    }}
                                />
                                <button
                                    onClick={() => addFriend(person.id)}
                                    className="add-friend-button"
                                    title={`Add ${person.name || person.email}`}
                                >
                                    <X size={12} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        ))}
                    </div>
            </div>
            </div>

            <div className="dashboard-main">
                <div className="embed-customization">
                    <h2 className="embed-title">Customize Your Webring</h2>
                    <p className="embed-subtitle">
                        Choose how your webring embed will look on your website. The arrows will navigate through your selected friends.
                    </p>

                    <div className="customization-section">
                        <label className="customization-label">Colour</label>
                        <div className="color-selection-row">
                            <div className="color-options">
                                {['black', 'red', 'yellow', 'white'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => updateEmbedSettings({ color })}
                                        className={`color-option ${embedSettings.color === color ? 'active' : ''}`}
                                        style={{
                                            backgroundColor: color === 'white' ? '#ffffff' : 
                                                           color === 'red' ? '#ba0e34' : 
                                                           color === 'yellow' ? '#ffd54f' : '#000000',
                                            border: color === 'white' ? '2px solid #e0e0e0' : 'none'
                                        }}
                                    />
                                ))}
                                <button
                                    onClick={() => updateEmbedSettings({ color: 'custom' })}
                                    className={`color-option transparent-pattern-option ${embedSettings.color === 'custom' ? 'active' : ''}`}
                                    title="Custom color"
                                />
                            </div>
                            
                            <div className="custom-color-input-wrapper">
                                <input
                                    type="text"
                                    value={embedSettings.customColor}
                                    onChange={(e) => {
                                        let value = e.target.value;
                                        if (value && !value.startsWith('#')) {
                                            value = '#' + value;
                                        }
                                        updateEmbedSettings({ color: 'custom', customColor: value });
                                    }}
                                    placeholder="#000000"
                                    className="hex-input"
                                    maxLength={7}
                                />
                                <input
                                    type="color"
                                    value={embedSettings.customColor || '#000000'}
                                    onChange={(e) => updateEmbedSettings({ color: 'custom', customColor: e.target.value })}
                                    className="color-picker-inline"
                                    title="Pick color"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="customization-section">
                        <label className="customization-label">Arrow</label>
                        <div className="arrow-options">
                            {[
                                { value: 'arrow', icon: '→' },
                                { value: 'chevron', icon: '›' },
                                { value: 'angle', icon: '〉' }
                            ].map((arrow) => (
                                <button
                                    key={arrow.value}
                                    onClick={() => updateEmbedSettings({ arrow: arrow.value })}
                                    className={`arrow-option ${embedSettings.arrow === arrow.value ? 'active' : ''}`}
                                >
                                    {arrow.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="customization-section">
                        <label className="customization-label">Preview</label>
                        <div className="embed-preview">
                            <button className="embed-nav-button-preview" style={{ color: getArrowColor() }}>
                                <span style={{ fontSize: '28px' }}>{getArrowIcon('left')}</span>
                            </button>
                            {embedSettings.color === 'custom' && embedSettings.customColor ? (
                                <div 
                                    className="embed-icon"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: embedSettings.customColor,
                                        mask: `url(${getIconPath()}) center/contain no-repeat`,
                                        WebkitMask: `url(${getIconPath()}) center/contain no-repeat`,
                                    }}
                                />
                            ) : (
                                <img 
                                    src={getIconPath()}
                                    alt="Webring icon"
                                    className="embed-icon"
                                />
                            )}
                            <button className="embed-nav-button-preview" style={{ color: getArrowColor() }}>
                                <span style={{ fontSize: '28px' }}>{getArrowIcon('right')}</span>
                        </button>
                    </div>
                </div>

                    <div className="customization-section">
                        <label className="customization-label">Code Snippet</label>
                        <div className="code-snippet-container">
                            <code className="code-snippet">
                                {getEmbedCodeDisplay()}
                            </code>
                            <button onClick={copyEmbedCode} className="copy-code-button">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="code-help-text">
                            Paste this code in your website's HTML. You can manually edit the <code style={{background: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem'}}>data-color</code>, <code style={{background: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem'}}>data-arrow</code>, and <code style={{background: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem'}}>data-custom-color</code> attributes to customize the appearance!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
