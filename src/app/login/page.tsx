'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useRef } from 'react';

import logo_large from '@/assets/logo_large.png';
import { SERVER } from '@/lib/server';

import { useCookies } from 'next-client-cookies';

import { useRouter } from 'next/navigation';

export default function Page() {
	const usernameRef = React.useRef<HTMLInputElement>(null);
	const passwordRef = React.useRef<HTMLInputElement>(null);

	const cookies = useCookies();
	const router = useRouter();

	return (
		<div className="w-full h-full flex flex-col justify-center items-center gap-10 -translate-y-20">
			<img src={logo_large.src} alt="Logo" className="w-[50%] md:w-56" />

			<form
				action=""
				onSubmit={async e => {
					e.preventDefault();

					if (!usernameRef.current || !passwordRef.current) return;

					const username = usernameRef.current.value.toLowerCase().trim();
					const password = passwordRef.current.value.toLowerCase().trim();

					if (!username || !password) return alert('Please fill in all fields.');

					const { valid } = await SERVER.validateToken.query({ username, password });
					if (!valid) return alert('Invalid username or password.');

					cookies.set('token', btoa(`${username}:${password}`), {
						expires: new Date(Date.now() + 1000 * 60 * 60 * 6),
					});

					router.prefetch('/');
					router.push('/');
				}}
			>
				<Card className="w-full max-w-sm">
					<CardHeader>
						<CardTitle className="text-2xl">Login</CardTitle>
						<CardDescription>
							Enter your username below to login to your account.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="username">Username</Label>
							<Input
								ref={usernameRef}
								id="username"
								type="text"
								placeholder=""
								required
								autoFocus
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input ref={passwordRef} id="password" type="password" required />
						</div>
					</CardContent>
					<CardFooter>
						<Button className="w-full">Sign in</Button>
					</CardFooter>
				</Card>
			</form>
		</div>
	);
}
