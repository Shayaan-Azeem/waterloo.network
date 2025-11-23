import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('webring_session');
        return NextResponse.json({ message: 'Logged out' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

