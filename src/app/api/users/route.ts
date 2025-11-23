import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                program: true,
                year: true,
                profilePic: true,
                website: true,
                instagram: true,
                twitter: true,
                linkedin: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Users API Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

