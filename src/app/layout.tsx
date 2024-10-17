import React from 'react';

import '../../globals.css';
import '@/global.scss';

import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/hooks/use-store';
import { LocalStorageProvider } from '@/hooks/use-local-storage';
import { CookiesProvider } from 'next-client-cookies/server';

import { cookies, headers } from 'next/headers';

import { updateToken } from '@/lib/server';

import { SERVER } from '@/lib/server';

import { redirect } from 'next/navigation';

const Main = async ({ children }: { children: React.ReactNode }) => {
	let token = cookies().get('token')?.value;

	if (token) {
		const [username, password] = atob(token).split(':');
		const { valid } = await SERVER.validateToken.query({ username, password });

		if (valid) updateToken(token);
		else token = undefined;
	}

	let path = headers().get('x-url') || '/';

	if (!token && path != '/login') {
		redirect('/login');
	}

	return (
		<main className="max-w-[1200px] overflow-hidden h-screen bg-background relative mx-auto">
			{children}
		</main>
	);
};

import Head from 'next/head';

import icon from '@/assets/icon.png';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" type="image/png" href="/icon.png" />
				<meta name="apple-mobile-web-app-title" content="Settlemyre Messenger" />
				<meta
					name="viewport"
					key={1}
					content="maximum-scale=1, width=device-width, initial-scale=1.0, user-scalable=no"
				/>
				<title>Settlemyre Messenger</title>
			</head>
			<body>
				<LocalStorageProvider>
					<StoreProvider>
						<CookiesProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="system"
								enableSystem
								disableTransitionOnChange
							>
								<Main>{children}</Main>
							</ThemeProvider>
						</CookiesProvider>
					</StoreProvider>
				</LocalStorageProvider>
			</body>
		</html>
	);
}
