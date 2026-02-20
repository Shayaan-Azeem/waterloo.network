import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

async function ensureDataDir() {
    const dir = path.dirname(SUBMISSIONS_FILE);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function readSubmissions(): Promise<unknown[]> {
    try {
        const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.name.trim()) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (!body.website || !body.website.trim()) {
            return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
        }

        // Generate ID from name
        const id = body.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // Parse connections string into array
        const connections = body.connections
            ? body.connections.split(',').map((c: string) => c.trim()).filter((c: string) => c)
            : [];

        const submission = {
            id,
            name: body.name.trim(),
            website: body.website.trim(),
            program: body.program?.trim() || undefined,
            year: body.year?.trim() || undefined,
            instagram: body.instagram?.trim() || undefined,
            twitter: body.twitter?.trim() || undefined,
            linkedin: body.linkedin?.trim() || undefined,
            connections: connections.length > 0 ? connections : undefined,
            submittedAt: new Date().toISOString(),
        };

        // Read existing submissions, append, and write back
        await ensureDataDir();
        const submissions = await readSubmissions();
        submissions.push(submission);
        await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));

        return NextResponse.json({ success: true, id: submission.id });
    } catch {
        return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
    }
}
