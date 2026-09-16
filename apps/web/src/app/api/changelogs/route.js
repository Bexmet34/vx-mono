import { NextResponse } from 'next/server';
import { getChangelogs } from '@veyronix/database';

export const revalidate = 60; // 1 dakika cache

export async function GET() {
    try {
        const logs = await getChangelogs();
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
