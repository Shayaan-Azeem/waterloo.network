import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const connections = await prisma.connection.findMany();
        return NextResponse.json(connections);
    } catch (error) {
        console.error('Connections API Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

