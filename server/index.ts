import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { router } from './trpc';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { createContext } from './authorization';

import { procedures } from './procedures';

import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from './config';

import axios from 'axios';

import { Hono } from 'hono';
import { streamText } from 'hono/streaming';

import { trpcServer } from '@hono/trpc-server';

import { toolResponse } from './gpt';

const appRouter = router(procedures);

export type AppRouter = typeof appRouter;

// const handler = createHTTPHandler({
// 	router: appRouter,
// 	createContext,
// 	// responseMeta(opts) {
// 	// 	const { ctx, paths, errors, type } = opts;
// 	// 	// assuming you have all your public routes with the keyword `public` in them
// 	// 	const allPublic = paths && paths.every(path => path.includes('getMessages'));
// 	// 	// checking that no procedures errored
// 	// 	const allOk = errors.length === 0;
// 	// 	// checking we're doing a query request
// 	// 	const isQuery = type === 'query';

// 	// 	// console.log(ctx, allPublic, allOk, isQuery);
// 	// 	if (ctx && allPublic && allOk && isQuery) {
// 	// 		// cache request for 1 day + revalidate once every second
// 	// 		const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
// 	// 		return {
// 	// 			headers: new Headers([
// 	// 				['cache-control', `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`],
// 	// 			]),
// 	// 		};
// 	// 	}
// 	// 	return {};
// 	// },
// });

const createTool = (name: string, desc: string, func: Function) => ({
	type: 'function',
	function: {
		function: func,
		name: name,
		description: desc,
	},
});

const app = new Hono();

app.use('*', async (c, next) => {
	c.res.headers.set('Access-Control-Allow-Origin', '*');
	c.res.headers.set('Access-Control-Request-Method', '*');
	c.res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
	c.res.headers.set('Access-Control-Allow-Headers', '*');

	if (c.req.method === 'OPTIONS') {
		return c.text('', 200);
	}

	await next();
});

app.use('/trpc/*', trpcServer({ router: appRouter, createContext }));

app.get('/getImage', async c => {
	try {
		const [imageUrl] = c.req.queries('imageUrl') || [];

		if (!imageUrl) throw new Error('No image URL provided');

		console.log(imageUrl);

		const auth =
			'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

		// Fetch the image using Axios
		const response = await axios.get(imageUrl, {
			responseType: 'arraybuffer', // So we can send raw image data
			headers: {
				Authorization: auth,
			},
		});

		// return c.text('SUCCESS', 200);

		return c.body(response.data, 200, {
			'Content-Type': response.headers['content-type'],
		});
	} catch (error) {
		console.error('Failed to fetch the image:', error);
		return c.text('', 500);
	}
});

app.post('/getSuggestedMessage', async c => {
	const { messages } = await c.req.json();
	if (!messages) return c.text('', 400);

	let _messages = messages.sort(
		(a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	let firstUserMessageIndex = _messages.findIndex((m: any) => m.direction == 'INBOUND');
	let firstUserMessage = _messages[firstUserMessageIndex];

	let userCategory = firstUserMessage.category.toUpperCase();

	_messages = _messages
		.slice(firstUserMessageIndex, 3)
		.map((m: any) => {
			const isCustomerMessage = m.direction == 'INBOUND';

			if (isCustomerMessage) {
				const hasMedia = m.media && m.media.length > 0;
				const noBody = () => (hasMedia ? '[ATTACHMENT]' : '[EMPTY MESSAGE]');
				const body = m.body || noBody();

				return { role: 'user', content: `${body}` };
			}

			return { role: 'assistant', content: m.body };
		})
		.reverse();

	const tools = [
		createTool(
			'getSuggestedMessage',
			'Provided with a list of messages, return a new message that we might want to send to the customer.',
			() => {
				return _messages;
			},
		),
		createTool('getCustomerName', 'Get the name of the customer we are messaging.', () => {
			return messages.find((m: any) => m.direction == 'INBOUND')?.name || '[Unknown]';
		}),
		createTool(
			'getFAQ',
			'Get a list of frequently asked questions. May be used to help the customer.',
			() => {
				return [
					[
						'How often should I water my plants?',
						"Watering frequency depends on the type of plant and its specific needs. As a general rule, most plants prefer to be watered when the top inch of soil feels dry. However, it's important to avoid overwatering, as this can lead to root rot. We recommend checking the moisture level of your plants regularly and adjusting your watering schedule accordingly.",
					],
					[
						'What kind of light do plants need?',
						"Plants have different light requirements depending on their species. While some plants thrive in direct sunlight, others prefer indirect or low light conditions. Research the specific light needs of your plants and place them in an appropriate location in your home. If you're unsure, feel free to reach out to us for guidance on the best lighting conditions for your plants.",
					],
					[
						'How do I prevent pests from damaging my plants?',
						"Pests can be a common issue for indoor and outdoor plants. To prevent pest infestations, regularly inspect your plants for any signs of pests such as webs, holes in leaves, or discoloration. Use natural pest control methods like neem oil or insecticidal soap to deter pests. Additionally, maintaining good plant hygiene by removing dead leaves and regularly cleaning your plant's foliage can help prevent pest problems.",
					],
					[
						'How do I repot my plants?',
						'Repotting is necessary when your plant outgrows its current container or when the soil becomes compacted. To repot your plant, gently remove it from its current pot, loosen the roots, and place it in a slightly larger pot with fresh potting soil. Be careful not to damage the roots during the process. Water the plant thoroughly after repotting and monitor its condition to ensure a successful transition.',
					],
					[
						'How can I promote healthy growth in my plants?',
						"To promote healthy growth in your plants, provide them with the right conditions, including proper lighting, appropriate watering, and regular fertilization. Each plant has specific fertilization needs, so choose a fertilizer suitable for your plant's requirements. Additionally, pruning your plants to remove dead or damaged foliage can stimulate new growth and maintain their overall health.",
					],
					[
						'Does Settlemyre Nursery deliver?',
						'Yes, we offer local delivery to select zip codes within approximately 60 miles of our nursery. Some of these areas include Valdese, Morganton, Hickory, Lenoir, Lake James, Gastonia, Statesville, Boone, Blowing Rock, Mooresville, and Lincolnton. Your cart will present you with delivery pricing at checkout, determined based on the size of the order and your zip code.',
					],
					[
						'Does Settlemyre Nursery only sell shrubs?',
						'We carry a wide variety of products and plants at our nursery including trees, shrubs, perennial flowers, flowering annuals, fine ceramic pottery and bird baths, house plants, potting soils, fertilizers, bulk mulch, compost, and premium soil mix. Come see us and browse our selection!',
					],
					[
						'Is Settlemyre Nursery open year- round?',
						'Yes, our nursery operates year-round, offering a wide variety of shrubs, trees, and annual bedding plants. We are closed for select holidays throughout the year. Contact us for specific holiday hours.',
					],
					[
						'Where is Settlemyre Nursery located?',
						'We are located right outside of Morganton, NC. Our address is 1387 Drexel Rd, Valdese, NC 28690. We are conveniently located just a half mile off of Interstate 40, exit 107. Westbound or eastbound, make a right off the exit, and we will be on your left.',
					],
					[
						'Does Settlemyre Nursery ship?',
						'Currently, we are not offering shipping on any live plant material. All plants, shrubs, trees, flowers, and other live material are for local pickup/delivery only. However, we do offer shipping on garden flags, welcome mats, local honey, and elderberry syrups. Contact us directly for a quote.',
					],
					[
						'Will our plants survive in your area?',
						'All of the plants that we carry will survive through the winter in USDA Zone 7. We carry plants from USDA Zones 3-7. Additionally, we have a large selection of indoor house plants.',
					],
					[
						'When is the best time of year to plant?',
						'All of our plants are sold in a pot or container, allowing for year-round planting. In summer, plants will need to be watered about two to three times per week while temperatures are high. Late fall planting is advised if water is not easily accessible. Transplanting is recommended from late fall to winter when temperatures are cooler. Remember to water even in winter! Please refer to our planting guide below for best results.',
					],
					[
						'Does Settlemyre Nursery offer landscape design?',
						"Yes, please visit our Landscape Design page for all the details, including information on our popular 'Sketch and Go' option.",
					],
					[
						'How do I plant trees, shrubs, or flowers?',
						"Planting doesn't need to be a mystery or something to be intimidated by! Most gardeners find planting to be relaxing and therapeutic. We have prepared a planting guide that we hope you will find helpful. Feel free to reference it when you begin your project.",
					],
				];
			},
		),
		createTool(
			'getCompanyInfo',
			'Get additional information about the company that can be used to aid in the response.',
			() => {
				return `Phone number: (828) 874-0679

                        Email: sales@settlemyrenursery.com

                        Address: 1387 Drexel Rd, Valdese, NC 28690


                        Be sure to contact us today for any questions, service scheduling or for order placing. You can call, text, email or plan a visit. We will respond as fast as we can, busier seasons may display slower response times.

                        Garden Center Operational Hours
                        Spring Season
                        March - June
                        Monday - Friday 8-5:30, Sat 8-2. Closed on Sunday

                        Summer Season
                        July - August
                        Thursday & Friday 8-5:30, Saturday 8-2.
                        Closed Sunday-Wednesday

                        Fall Season
                        September - October
                        Monday - Friday 8-5:30, Sat 8-2. Closed on Sunday.

                        Winter Season
                        November - February
                        Thursday & Friday 9-5, Saturday 8-2.
                        *Landscape Designs, Consulations, Installations will operate year-round. Appointments will be scheduled.

                        Holiday Hours
                        Closed January 1st
                        Closed the week of July 4th
                        Closed Thanksgiving Day & Friday after. RE-OPEN Saturday after
                        Closed the week of Christmas
                        (2024 Christmas Closed Dates: Mon Dec 23 - Sat Dec 28) RE-OPEN Thursday Jan 2`;
			},
		),
	];

	return streamText(c, async stream => {
		await toolResponse(_messages, tools, (content, chunk) => {
			stream.write(content);
		});
	});
});

// const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
// 	res.setHeader('Access-Control-Allow-Origin', '*');
// 	res.setHeader('Access-Control-Request-Method', '*');
// 	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
// 	res.setHeader('Access-Control-Allow-Headers', '*');

// 	if (req.method === 'OPTIONS') {
// 		res.writeHead(200);
// 		res.end();
// 		return;
// 	}

// 	try {
// 		const pathname = new URL(req.url || '', `http://${req.headers.host}`).pathname;
// 		const queryParams = new URL(req.url || '', `http://${req.headers.host}`).searchParams;

// 		if (req.method === 'GET' && pathname.includes('/getImage')) {
// 			try {
// 				const imageUrl = queryParams.get('imageUrl');

// 				if (!imageUrl) throw new Error('No image URL provided');

// 				const auth =
// 					'Basic ' +
// 					Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

// 				// Fetch the image using Axios
// 				const response = await axios.get(imageUrl, {
// 					responseType: 'arraybuffer', // So we can send raw image data
// 					headers: {
// 						Authorization: auth,
// 					},
// 				});

// 				res.writeHead(200, { 'Content-Type': response.headers['content-type'] });
// 				res.end(response.data);
// 				return;
// 			} catch (error) {
// 				console.error('Failed to fetch the image:', error);
// 				res.statusCode = 500;
// 				res.end();
// 				return;
// 			}
// 		}
// 	} catch (error) {
// 		console.log('ERROR GETTING URL');
// 	}

// 	handler(req, res);
// });

// server.listen(3001, () => {
// 	console.log('Server is running on port 3001');
// });

export default app;
