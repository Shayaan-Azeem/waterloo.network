import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const MEMBERS_FILE = path.join(process.cwd(), 'src', 'data', 'members.ts');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function checkAuth(request: NextRequest): boolean {
    const password = request.headers.get('x-admin-password');
    return password === ADMIN_PASSWORD;
}

// Parse members array from members.ts
async function parseMembers(): Promise<Record<string, string | string[] | undefined>[]> {
    const content = await fs.readFile(MEMBERS_FILE, 'utf-8');

    // Extract the array content between the markers
    const startMarker = '// ADD YOUR ENTRY BELOW THIS LINE';
    const endMarker = '// ADD YOUR ENTRY ABOVE THIS LINE';
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) return [];

    const arrayContent = content.substring(startIdx + startMarker.length, endIdx);

    // Parse individual member objects using regex
    const members: Record<string, string | string[] | undefined>[] = [];
    const memberRegex = /\{([^}]+)\}/g;
    let match;

    while ((match = memberRegex.exec(arrayContent)) !== null) {
        const block = match[1];
        // Skip commented-out blocks
        if (block.trim().startsWith('//')) continue;

        const member: Record<string, string | string[] | undefined> = {};

        // Parse string fields
        const stringFields = ['id', 'name', 'website', 'program', 'year', 'profilePic', 'instagram', 'twitter', 'linkedin'];
        for (const field of stringFields) {
            const fieldMatch = block.match(new RegExp(`${field}:\\s*"([^"]*)"`, 'm'));
            if (fieldMatch) member[field] = fieldMatch[1];
        }

        // Parse connections array
        const connMatch = block.match(/connections:\s*\[([^\]]*)\]/);
        if (connMatch && connMatch[1].trim()) {
            member.connections = connMatch[1].match(/"([^"]*)"/g)?.map(s => s.replace(/"/g, '')) || [];
        }

        if (member.id) members.push(member);
    }

    return members;
}

// Rebuild the members.ts file content
async function writeMember(members: Record<string, string | string[] | undefined>[]) {
    const content = await fs.readFile(MEMBERS_FILE, 'utf-8');

    const startMarker = '// ADD YOUR ENTRY BELOW THIS LINE';
    const endMarker = '// ADD YOUR ENTRY ABOVE THIS LINE';
    const before = content.substring(0, content.indexOf(startMarker) + startMarker.length);
    const after = content.substring(content.indexOf(endMarker));

    // Keep the commented example
    const exampleBlock = `

  // Example entry (copy this as a template):
  // {
  //   id: "john-doe",
  //   name: "John Doe",
  //   website: "https://johndoe.com",
  //   program: "Computer Science",
  //   year: "2026",
  //   profilePic: "/photos/john-doe.jpg",
  //   instagram: "https://instagram.com/johndoe",
  //   twitter: "https://x.com/johndoe",
  //   linkedin: "https://linkedin.com/in/johndoe",
  //   connections: ["jane-smith", "bob-wilson"],
  // },
`;

    const memberEntries = members.map(m => {
        const lines = [`  {`];
        lines.push(`    id: "${m.id}",`);
        lines.push(`    name: "${m.name}",`);
        lines.push(`    website: "${m.website}",`);
        if (m.program) lines.push(`    program: "${m.program}",`);
        if (m.year) lines.push(`    year: "${m.year}",`);
        if (m.profilePic) lines.push(`    profilePic: "${m.profilePic}",`);
        if (m.instagram) lines.push(`    instagram: "${m.instagram}",`);
        if (m.twitter) lines.push(`    twitter: "${m.twitter}",`);
        if (m.linkedin) lines.push(`    linkedin: "${m.linkedin}",`);
        if (m.connections && Array.isArray(m.connections) && m.connections.length > 0) {
            const conns = m.connections.map(c => `"${c}"`).join(', ');
            lines.push(`    connections: [${conns}],`);
        }
        lines.push(`  },`);
        return lines.join('\n');
    }).join('\n');

    const newContent = before + exampleBlock + (memberEntries ? memberEntries + '\n' : '') + '\n  ' + after;
    await fs.writeFile(MEMBERS_FILE, newContent, 'utf-8');
}

// GET - list all current members
export async function GET(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const members = await parseMembers();
    return NextResponse.json({ members });
}

// PUT - update a member
export async function PUT(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
        return NextResponse.json({ error: 'Member id required' }, { status: 400 });
    }

    const members = await parseMembers();
    const index = members.findIndex(m => m.id === body.originalId || m.id === body.id);
    if (index === -1) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Update the member
    members[index] = {
        id: body.id,
        name: body.name,
        website: body.website,
        program: body.program || undefined,
        year: body.year || undefined,
        profilePic: body.profilePic || undefined,
        instagram: body.instagram || undefined,
        twitter: body.twitter || undefined,
        linkedin: body.linkedin || undefined,
        connections: body.connections?.length ? body.connections : undefined,
    };

    await writeMember(members);
    return NextResponse.json({ success: true });
}

// DELETE - remove a member
export async function DELETE(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
        return NextResponse.json({ error: 'Member id required' }, { status: 400 });
    }

    const members = await parseMembers();
    const filtered = members.filter(m => m.id !== body.id);

    if (filtered.length === members.length) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    await writeMember(filtered);
    return NextResponse.json({ success: true });
}
