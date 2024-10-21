import { publicProcedure } from './trpc';
import { z } from 'zod';
import axios from 'axios';

import { Users, LastRead } from './database';

import {
	getMessages as GetMessages,
	getUserProfile,
	sendMessage as SendMessage,
	getUserProfileFromCustNo,
	getMostRecentCustomerConversations,
} from './ms-database';

const status = publicProcedure.query(async () => {
	return { status: 'Hello, Next.js!' };
});

const userExample = publicProcedure.query(async o => {
	if (!o.ctx.user) return { status: 'Unauthorized' };
	return { status: 'Hello, User!' };
});

const validateTokenInput = z.object({
	username: z.string(),
	password: z.string(),
});
const validateToken = publicProcedure.input(validateTokenInput).query(async ({ input }) => {
	const username = input.username.toLowerCase();
	const password = input.password.toLowerCase();

	const user = await Users.find(username);
	if (user == null) return { valid: false };

	if (!user.checkPassword(password)) return { valid: false };

	return { valid: true };
});

const getMessagesInput = z
	.object({
		search: z.string().optional(),
	})
	.optional();
const getMessages = publicProcedure.input(getMessagesInput).query(async ({ ctx, input }) => {
	if (!ctx.user) return [];

	const { search } = input || { search: '' };
	let messages = await GetMessages(search);
	// console.log(messages.map(m => m.body));
	return messages;
});

const userProfileInput = z.object({
	phone_number: z.string(),
});
const userProfile = publicProcedure.input(userProfileInput).query(async ({ ctx, input }) => {
	if (!ctx.user) return null;

	if (!input.phone_number) return null;
	return await getUserProfile(input.phone_number);
});

const updateSubscriptionInput = z.object({
	cust_no: z.string(),
	status: z.boolean(),
});
const updateSubscription = publicProcedure
	.input(updateSubscriptionInput)
	.mutation(async ({ ctx, input }) => {
		if (!ctx.user) return { success: false, reason: 'Unauthorized' };

		const user = await getUserProfileFromCustNo(input.cust_no);
		if (!user) return { success: false, reason: 'User not found' };
		await user.updateSubscription(input.status);
		return { success: true, reason: '' };
	});

const sendMessageInput = z.object({
	to: z.string(),
	body: z.string(),
	category: z.string(),
	name: z.string(),
});
const sendMessage = publicProcedure.input(sendMessageInput).mutation(async ({ ctx, input }) => {
	if (!ctx.user) return { success: false };

	if (!input.to) return { success: false };
	if (!input.body) return { success: false };

	// Customer Name = input.name

	await SendMessage(input.to, input.body, input.category, ctx.user.displayName);

	return { success: true };
});

const getReadStatusInput = z.object({
	custPhone: z.string(),
});
const getReadStatus = publicProcedure.input(getReadStatusInput).query(async ({ ctx, input }) => {
	if (!ctx.user) return { isRead: true };

	const status = await LastRead.getReadStatus(ctx.user.id, input.custPhone);

	return { isRead: status };
});

type RecentConvo = {
	from: string;
	body: string;
	date: string;
	name: string;
	readStatus: boolean;
};

const getRecentConversations = publicProcedure.query(async ({ ctx }): Promise<RecentConvo[]> => {
	if (!ctx.user) return [];

	const convos = await Promise.all(
		(await getMostRecentCustomerConversations())
			.slice(0, 30)
			.map((convo): Promise<RecentConvo | null> => {
				return new Promise(async (resolve, reject) => {
					if (!ctx.user) return resolve(null);
					const readStatus = await LastRead.getReadStatus(ctx.user.id, convo.from);

					resolve({
						from: convo.from,
						body: convo.body,
						date: convo.date,
						name: convo.name,
						readStatus,
					});
				});
			}),
	);

	return convos.filter(convo => convo != null);
});

export const procedures = {
	status,
	validateToken,
	getMessages,
	userProfile,
	updateSubscription,
	sendMessage,
	getReadStatus,
	getRecentConversations,
};
