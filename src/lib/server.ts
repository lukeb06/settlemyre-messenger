import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './../../server/index';

let token: string | null = null;

export function updateAuth(username: string, password: string) {
	username = username.toLowerCase();
	password = password.toLowerCase();

	token = btoa(`${username}:${password}`);
}

export function updateToken(newToken: string) {
	token = newToken;
}

const SERVER_IP = 'http://192.168.1.16:3001';

export const endpoint = (path: string) => `${SERVER_IP}/${path}`;

export const SERVER = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: SERVER_IP,
			headers() {
				return token ? { Authorization: `Basic ${token}` } : {};
			},
		}),
	],
});

export type Messages = Awaited<ReturnType<typeof SERVER.getMessages.query>>;
export type User = Awaited<ReturnType<typeof SERVER.userProfile.query>>;
