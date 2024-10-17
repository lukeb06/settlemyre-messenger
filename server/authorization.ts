import * as trpc from '@trpc/server/adapters/standalone';
import { Users } from './database';

class ClientUser {
	username: string;

	constructor(username: string) {
		this.username = username;
	}
}

async function verifyUser(token: string) {
	token = atob(token);

	let username = token.split(':')[0].toLowerCase();
	let password = token.split(':')[1].toLowerCase();

	let user = Users.find(username);
	if (user == null) return null;

	if (user.checkPassword(password)) return new ClientUser(username);

	return null;
}

export async function createContext({ req, res }: trpc.CreateHTTPContextOptions) {
	// Create your context based on the request object
	// Will be available as `ctx` in all your resolvers
	// This is just an example of something you might want to do in your ctx fn
	async function getUserFromHeader() {
		if (req.headers.authorization) {
			const user = await verifyUser(req.headers.authorization.split(' ')[1]);
			return user;
		}
		return null;
	}
	const user = await getUserFromHeader();
	return {
		user,
	};
}
export type Context = Awaited<ReturnType<typeof createContext>>;
