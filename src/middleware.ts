import { NextResponse } from 'next/server';

export function middleware(request: Request) {
	// Store current request url in a custom header, which you can read later
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-url', new URL(request.url).pathname);
	requestHeaders.set('x-host', new URL(request.url).host.split(':')[0]);
	requestHeaders.set('x-prot', new URL(request.url).protocol);

	return NextResponse.next({
		request: {
			// Apply new request headers
			headers: requestHeaders,
		},
	});
}
