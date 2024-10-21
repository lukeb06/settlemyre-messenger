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

// const SERVER_IP = 'http://192.168.1.16:3001';
const SERVER_IP = 'http://192.168.100.7:3001';

export const endpoint = (path: string) => `${SERVER_IP}/${path}`;

export const SERVER = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: SERVER_IP + '/trpc',
			headers() {
				return token ? { Authorization: `Basic ${token}` } : {};
			},
		}),
	],
});

export type Messages = Awaited<ReturnType<typeof SERVER.getMessages.query>>;
export type User = Awaited<ReturnType<typeof SERVER.userProfile.query>>;
export type Conversations = Awaited<ReturnType<typeof SERVER.getRecentConversations.query>>;
export type Conversation = Conversations[number];

let lastAITime = 0;

function canMakeAIRequest() {
	return Date.now() - lastAITime > 3000;
}

export const getSuggestedMessage = async (messages: Messages, stream: boolean = false) => {
	if (!canMakeAIRequest()) return null;

	lastAITime = Date.now();

	const response = await fetch(endpoint('getSuggestedMessage'), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ messages }),
	});

	if (stream) return response;

	if (!response.body) return null;

	const reader = response.body.getReader();

	return new Promise((resolve, reject) => {
		let text = '';

		// Function to read chunks of data
		const readChunk = (): any => {
			return reader.read().then(({ done, value }) => {
				if (done) return resolve(text);

				// Decode the chunk of data (assuming UTF-8 encoding)
				const textChunk = new TextDecoder('utf-8').decode(value);

				// Process the text chunk
				text += textChunk;
				// console.log(textChunk);

				// Read the next chunk
				return readChunk();
			});
		};

		readChunk();
	});
};
