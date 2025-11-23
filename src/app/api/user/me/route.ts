import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionEmail = cookieStore.get('webring_session')?.value;

        if (!sessionEmail) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: sessionEmail },
            include: {
                connections: { include: { toUser: true } },
                connectedBy: { include: { fromUser: true } },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('User API Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const sessionEmail = cookieStore.get('webring_session')?.value;

        if (!sessionEmail) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const { name, program, year, website, bio, profilePic, instagram, twitter, linkedin, embedColor, embedArrow, embedCustomColor } = body;

        const user = await prisma.user.update({
            where: { email: sessionEmail },
            data: {
                name,
                program,
                year,
                website,
                bio,
                profilePic,
                instagram,
                twitter,
                linkedin,
                embedColor,
                embedArrow,
                embedCustomColor,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('User Update Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
