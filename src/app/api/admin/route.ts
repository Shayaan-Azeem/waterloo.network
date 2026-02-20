import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');
const MEMBERS_FILE = path.join(process.cwd(), 'src', 'data', 'members.ts');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function checkAuth(request: NextRequest): boolean {
    const password = request.headers.get('x-admin-password');
    return password === ADMIN_PASSWORD;
}

async function readSubmissions(): Promise<Record<string, unknown>[]> {
    try {
        const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeSubmissions(submissions: Record<string, unknown>[]) {
    const dir = path.dirname(SUBMISSIONS_FILE);
    try { await fs.access(dir); } catch { await fs.mkdir(dir, { recursive: true }); }
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// GET - list all pending submissions
export async function GET(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const submissions = await readSubmissions();
    return NextResponse.json({ submissions });
}

// POST - approve or reject a submission
export async function POST(request: NextRequest) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id || !['approve', 'reject'].includes(action)) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const submissions = await readSubmissions();
    const index = submissions.findIndex((s) => s.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = submissions[index];

    if (action === 'approve') {
        // Build the member entry
        const memberEntry = buildMemberEntry(submission);

        // Append to members.ts
        const membersContent = await fs.readFile(MEMBERS_FILE, 'utf-8');
        const insertMarker = '// ADD YOUR ENTRY ABOVE THIS LINE';
        const newContent = membersContent.replace(
            insertMarker,
            `${memberEntry}\n  ${insertMarker}`
        );
        await fs.writeFile(MEMBERS_FILE, newContent, 'utf-8');
    }

    // Remove from submissions
    submissions.splice(index, 1);
    await writeSubmissions(submissions);

    return NextResponse.json({
        success: true,
        action,
        remaining: submissions.length
    });
}

function buildMemberEntry(s: Record<string, unknown>): string {
    const lines = [
        `  {`,
        `    id: "${s.id}",`,
        `    name: "${s.name}",`,
        `    website: "${s.website}",`,
    ];

    if (s.program) lines.push(`    program: "${s.program}",`);
    if (s.year) lines.push(`    year: "${s.year}",`);
    if (s.instagram) lines.push(`    instagram: "${s.instagram}",`);
    if (s.twitter) lines.push(`    twitter: "${s.twitter}",`);
    if (s.linkedin) lines.push(`    linkedin: "${s.linkedin}",`);

    if (s.connections && Array.isArray(s.connections) && (s.connections as string[]).length > 0) {
        const conns = (s.connections as string[]).map(c => `"${c}"`).join(', ');
        lines.push(`    connections: [${conns}],`);
    }

    lines.push(`  },`);
    return lines.join('\n');
}
