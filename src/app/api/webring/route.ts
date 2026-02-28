import { NextRequest, NextResponse } from 'next/server';
import { members } from '@/data/members';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const WEBRING_MARKER = 'uwaterloo.network';

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'uwaterloo-webring/1.0' },
        });
        return response;
    } finally {
        clearTimeout(timeout);
    }
}

function extractScriptUrls(html: string, baseUrl: string): string[] {
    const urls: string[] = [];
    const regex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const src = match[1];
        if (src.startsWith('http')) {
            urls.push(src);
        } else if (src.startsWith('//')) {
            urls.push('https:' + src);
        } else if (src.startsWith('/')) {
            const origin = new URL(baseUrl).origin;
            urls.push(origin + src);
        }
    }
    return urls;
}

async function checkMemberHasEmbed(website: string): Promise<boolean> {
    const url = website.startsWith('http') ? website : `https://${website}`;
    
    try {
        const response = await fetchWithTimeout(url, 5000);
        if (!response.ok) return false;
        
        const html = await response.text();
        if (html.toLowerCase().includes(WEBRING_MARKER)) return true;
        
        const scriptUrls = extractScriptUrls(html, url);
        const batchSize = 5;
        for (let i = 0; i < scriptUrls.length; i += batchSize) {
            const batch = scriptUrls.slice(i, i + batchSize);
            const results = await Promise.allSettled(
                batch.map(async (scriptUrl) => {
                    const res = await fetchWithTimeout(scriptUrl, 4000);
                    if (!res.ok) return false;
                    const js = await res.text();
                    return js.toLowerCase().includes(WEBRING_MARKER);
                })
            );
            if (results.some((r) => r.status === 'fulfilled' && r.value === true)) {
                return true;
            }
        }
        
        return false;
    } catch {
        return false;
    }
}

// Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// API endpoint that returns webring members for the embed widget
// If userId is provided, returns that user's connections
// Otherwise returns all members
// Only returns members who have the embed installed on their website
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');
    
    // Find the user if specified
    const user = userId ? members.find(m => m.id === userId) : null;
    
    // Get the user's connections, or fall back to all members
    let candidateMembers;
    
    if (user && user.connections && user.connections.length > 0) {
        // Return only the user's specified connections
        candidateMembers = members.filter(m => 
            user.connections!.includes(m.id) && m.website && m.website.trim()
        );
    } else {
        // Fallback: return all members with valid websites (excluding the user themselves)
        candidateMembers = members.filter(m => 
            m.website && m.website.trim() && m.id !== userId
        );
    }

    // Check which members have the embed installed
    const embedChecks = await Promise.allSettled(
        candidateMembers.map(async (m) => ({
            member: m,
            hasEmbed: await checkMemberHasEmbed(m.website),
        }))
    );

    // Filter to only include members with the embed
    const targetMembers = embedChecks
        .filter((r): r is PromiseFulfilledResult<{ member: typeof members[0]; hasEmbed: boolean }> => 
            r.status === 'fulfilled' && r.value.hasEmbed
        )
        .map(r => r.value.member);

    return NextResponse.json({
        members: targetMembers.map(m => ({
            id: m.id,
            name: m.name,
            website: m.website,
        })),
    }, {
        headers: {
            ...corsHeaders,
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
