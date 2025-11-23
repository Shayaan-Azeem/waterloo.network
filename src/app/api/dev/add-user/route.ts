import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, program, year, website, bio, profilePic, instagram, twitter, linkedin } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                email,
                name: name || null,
                program: program || null,
                year: year || null,
                website: website || null,
                bio: bio || null,
                profilePic: profilePic || null,
                instagram: instagram || null,
                twitter: twitter || null,
                linkedin: linkedin || null,
            }
        });

        return NextResponse.json({ 
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Dev Add User Error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

