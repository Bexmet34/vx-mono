import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  if (url.pathname === '/docs') {
    return NextResponse.redirect(new URL('/docs/tr', request.url));
  }
}

export const config = {
  matcher: ['/docs'],
};
