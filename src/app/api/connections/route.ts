import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionEmail = cookieStore.get('webring_session')?.value;

        if (!sessionEmail) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: sessionEmail },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { toUserId } = body;

        if (!toUserId) {
            return NextResponse.json({ error: 'Missing toUserId' }, { status: 400 });
        }

        const existingConnection = await prisma.connection.findFirst({
            where: {
                fromId: user.id,
                toId: toUserId,
            },
        });

        if (existingConnection) {
            return NextResponse.json({ error: 'Connection already exists' }, { status: 400 });
        }

        const connection = await prisma.connection.create({
            data: {
                fromId: user.id,
                toId: toUserId,
            },
        });

        return NextResponse.json(connection);
    } catch (error) {
        console.error('Connection Create Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionEmail = cookieStore.get('webring_session')?.value;

        if (!sessionEmail) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: sessionEmail },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { toUserId } = body;

        if (!toUserId) {
            return NextResponse.json({ error: 'Missing toUserId' }, { status: 400 });
        }

        await prisma.connection.deleteMany({
            where: {
                fromId: user.id,
                toId: toUserId,
            },
        });

        return NextResponse.json({ message: 'Connection deleted' });
    } catch (error) {
        console.error('Connection Delete Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

