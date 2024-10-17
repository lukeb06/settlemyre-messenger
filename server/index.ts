import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { router } from './trpc';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { createContext } from './authorization';

import { procedures } from './procedures';

import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from './config';

import axios from 'axios';

const appRouter = router(procedures);

export type AppRouter = typeof appRouter;

const handler = createHTTPHandler({
	router: appRouter,
	createContext,
	responseMeta(opts) {
		const { ctx, paths, errors, type } = opts;
		// assuming you have all your public routes with the keyword `public` in them
		const allPublic = paths && paths.every(path => path.includes('getMessages'));
		// checking that no procedures errored
		const allOk = errors.length === 0;
		// checking we're doing a query request
		const isQuery = type === 'query';

		// console.log(ctx, allPublic, allOk, isQuery);
		if (ctx && allPublic && allOk && isQuery) {
			// cache request for 1 day + revalidate once every second
			const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
			return {
				headers: new Headers([
					['cache-control', `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`],
				]),
			};
		}
		return {};
	},
});

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
	res.setHeader('Access-Control-Allow-Headers', '*');

	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}

	// console.log(req.url);

	try {
		const pathname = new URL(req.url || '', `http://${req.headers.host}`).pathname;
		const queryParams = new URL(req.url || '', `http://${req.headers.host}`).searchParams;

		if (req.method === 'GET' && pathname.includes('/getImage')) {
			try {
				const imageUrl = queryParams.get('imageUrl');

				if (!imageUrl) throw new Error('No image URL provided');

				const auth =
					'Basic ' +
					Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

				// Fetch the image using Axios
				const response = await axios.get(imageUrl, {
					responseType: 'arraybuffer', // So we can send raw image data
					headers: {
						Authorization: auth,
					},
				});

				// Return image data as a data URI
				const mimeType = response.headers['content-type'];
				const base64Data = Buffer.from(response.data).toString('base64');
				const dataURI = `data:${mimeType};base64,${base64Data}`;

				res.writeHead(200, { 'Content-Type': response.headers['content-type'] });
				res.end(response.data);
				return;
			} catch (error) {
				console.error('Failed to fetch the image:', error);
				res.statusCode = 500;
				res.end();
				return;
			}
		}
	} catch (error) {
		console.log('ERROR GETTING URL');
	}

	handler(req, res);
});

server.listen(3001, () => {
	console.log('Server is running on port 3001');
});
