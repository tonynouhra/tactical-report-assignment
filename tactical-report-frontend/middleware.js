import { NextResponse } from 'next/server';

export function middleware(request) {
    const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';

    if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuthenticated && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};