import { NextResponse } from 'next/server';
import { members } from '@/data/members';

interface EmbedcheckFailure {
  id: string;
  name: string;
  reason: string;
  url: string;
}

const WEBRING_MARKER = 'uwaterloo.network';

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

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'uwaterloo-webring-embedcheck/1.0' },
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function checkMemberSite(member: typeof members[0]): Promise<EmbedcheckFailure | null> {
  const url = member.website.startsWith('http')
    ? member.website
    : `https://${member.website}`;

  try {
    const response = await fetchWithTimeout(url, 5000);

    if (!response.ok) {
      return { id: member.id, name: member.name, reason: 'site unreachable', url };
    }

    const html = await response.text();

    if (html.toLowerCase().includes(WEBRING_MARKER)) {
      return null;
    }

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
        return null;
      }
    }

    return { id: member.id, name: member.name, reason: 'embed missing', url };
  } catch {
    return { id: member.id, name: member.name, reason: 'site unreachable', url };
  }
}

export async function GET() {
  const eligibleMembers = members.filter(
    (m) => m.website && m.website.trim()
  );

  const results = await Promise.allSettled(
    eligibleMembers.map((m) => checkMemberSite(m))
  );

  const failures: EmbedcheckFailure[] = results
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter((f): f is EmbedcheckFailure => f !== null);

  return NextResponse.json(
    { failures },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    }
  );
}
